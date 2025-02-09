"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsDocObj = exports.parseFileApiDoc = exports.mergeDeep = exports.healthDocObj = exports.createHtml = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
let html = '';
const mergeDeep = (target, source) => {
    for (let key in source) {
        if (target.hasOwnProperty(key)) {
            target[key] = [...target[key], ...source[key]];
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
};
exports.mergeDeep = mergeDeep;
const orderObj = (unordered) => {
    return Object.keys(unordered).sort().reduce((obj, key) => {
        obj[key] = unordered[key];
        return obj;
    }, {});
};
const compareApi = (a, b) => {
    const aPath = a.path.replace(/{/g, '-');
    const bPath = b.path.replace(/{/g, '-');
    if (aPath < bPath) {
        return -1;
    }
    if (aPath > bPath) {
        return 1;
    }
    if (a.method < b.method) {
        return -1;
    }
    if (a.method > b.method) {
        return 1;
    }
    return 0;
};
const orderApiObj = (apiObj) => {
    for (let key in apiObj) {
        apiObj[key] = apiObj[key].sort(compareApi);
    }
    return apiObj;
};
const parseParamValue = (value, secure) => {
    let param = {};
    let parts = value.split(/(\s+)/).filter((e) => { return e.trim().length > 0; });
    let group = '';
    if (parts[0].indexOf('(') > -1 && parts[0].indexOf(')') > parts[0].indexOf('(')) {
        group = parts[0].replace(/.*\(|\).*/g, '');
        parts.shift();
    }
    if (parts[0].indexOf('{') > -1 && parts[0].indexOf('}') > parts[0].indexOf('{')) {
        const paramType = parts[0].replace(/.*\{|\}.*/g, '');
        parts.shift();
        let paramStr = '';
        let paramDefault = '';
        let mandatory = true;
        if (parts[0].indexOf('[') > -1 && parts[0].indexOf(']') > parts[0].indexOf('[')) {
            paramStr = parts[0].replace(/.*\[|\].*/g, '');
            mandatory = false;
        }
        else {
            paramStr = parts[0];
        }
        if (paramStr.indexOf('=') > -1) {
            const paramParts = paramStr.split('=');
            paramStr = paramParts[0];
            paramDefault = paramParts[1];
        }
        parts.shift();
        const description = parts.join(' ');
        param = {
            group,
            type: paramType,
            name: paramStr,
            mandatory,
            default: paramDefault,
            description
        };
    }
    return param;
};
const parseKeyValue = (keyValues, secure) => {
    const res = {};
    keyValues.forEach(keyValue => {
        var _a;
        const parts = keyValue.split(' ');
        if (parts.length > 1) {
            let key;
            key = parts.length > 1 ? (_a = parts.shift()) !== null && _a !== void 0 ? _a : '' : '';
            let value = parts.join(' ').replace(/\n \*\n/g, '\n').replace(/\n \*/g, '\n');
            if (value.endsWith('\n *')) {
                value = value.substring(0, value.length - 4);
            }
            if (value.endsWith('\n')) {
                value = value.substring(0, value.length - 1);
            }
            if (key && value) {
                if (key === 'apiParam') {
                    if (!res.apiParams || !res.apiParams.length) {
                        res.apiParams = [];
                    }
                    res.apiParams.push(parseParamValue(value, secure));
                }
                else if (key === 'apiBody') {
                    if (!res.apiBody || !res.apiBody.length) {
                        res.apiBody = [];
                    }
                    res.apiBody.push(parseParamValue(value, secure));
                }
                else if (key === 'apiSuccess') {
                    if (!res.apiSuccess || !res.apiSuccess.length) {
                        res.apiSuccess = [];
                    }
                    res.apiSuccess.push(parseParamValue(value, secure));
                }
                else {
                    res[key] = value;
                }
            }
        }
    });
    return res;
};
const parseFileApiDoc = (fileName, secure) => {
    const apiDoc = {};
    const fileString = (0, fs_1.readFileSync)(fileName).toString();
    const parts = fileString.split('/**' + os_1.EOL);
    parts.forEach((part) => {
        var _a, _b;
        const keyValues = part.split(os_1.EOL + ' */' + os_1.EOL)[0].split(os_1.EOL + ' * @');
        if ((_a = keyValues[0]) === null || _a === void 0 ? void 0 : _a.startsWith(' * @')) {
            keyValues[0] = keyValues[0].replace(' * @', '');
        }
        ;
        const parsedKeyValues = parseKeyValue(keyValues, secure);
        const apiGroup = parsedKeyValues.apiGroup || '-';
        const api = parsedKeyValues.api || '';
        const apiObj = {};
        if (api) {
            const apiParts = api.trim().split(' ');
            const methodPart = apiParts[0] && apiParts[0].indexOf('}') > -1 ? 0 : (((_b = apiParts[1]) === null || _b === void 0 ? void 0 : _b.indexOf('}')) > -1 ? 1 : -1);
            const method = methodPart > -1 ? apiParts[methodPart].replace('{', '').replace('}', '').trim() : '';
            apiObj.method = method;
            apiObj.path = apiParts[methodPart + 1] ? apiParts[methodPart + 1] : '';
            apiParts.shift();
            apiParts.shift();
            if (methodPart > 0) {
                apiParts.shift();
            }
            apiObj.description = apiParts.join(' ');
            apiObj.secure = secure;
            apiObj.name = parsedKeyValues.apiName || '';
            apiObj.params = parsedKeyValues.apiParams ? parsedKeyValues.apiParams : [];
            apiObj.bodyParams = parsedKeyValues.apiBody ? parsedKeyValues.apiBody : [];
            apiObj.paramsExample = parsedKeyValues.apiParamsExample ? parsedKeyValues.apiParamsExample : [];
            apiObj.success = parsedKeyValues.apiSuccess ? parsedKeyValues.apiSuccess : [];
            apiObj.successExample = parsedKeyValues.apiSuccessExample ? parsedKeyValues.apiSuccessExample : '';
            apiObj.error = parsedKeyValues.apiError ? parsedKeyValues.apiError : '';
            apiObj.errorExample = parsedKeyValues.apiErrorExample ? parsedKeyValues.apiErrorExample : '';
            if (!(apiGroup in apiDoc)) {
                apiDoc[apiGroup] = [];
            }
            apiDoc[apiGroup].push(apiObj);
        }
    });
    return apiDoc;
};
exports.parseFileApiDoc = parseFileApiDoc;
const healthDocObj = (healthPath, livePath) => {
    return {
        Health: [
            {
                method: 'get',
                path: livePath,
                description: 'Liveness endpoint (server live)',
                params: [],
                bodyParams: [],
                success: [],
                successExample: 'Success Response:\n' +
                    '     HTTP/1.1 200 OK\n' +
                    '     {\n' +
                    '       "check": "liveness"\n' +
                    '       "status": "up"\n' +
                    '     }',
                error: 'Server is not live, cannot reply to calls',
                errorExample: 'Error-Response:\n' +
                    '     HTTP/1.1 503 Service unavailable'
            },
            {
                method: 'get',
                path: healthPath,
                description: 'Readiness endpoint (all ready)',
                params: [],
                bodyParams: [],
                success: [],
                successExample: 'Success Response:\n' +
                    '     HTTP/1.1 200 OK\n' +
                    '     {\n' +
                    '       "check": "readyness"\n' +
                    '       "status": "ready"\n' +
                    '     }',
                error: 'Server is live but not yet ready',
                errorExample: 'Error-Response:\n' +
                    '     HTTP/1.1 503 Service unavailable\n' +
                    '     {\n' +
                    '       "check": "readyness"\n' +
                    '       "status": "not ready"\n' +
                    '     }'
            }
        ]
    };
};
exports.healthDocObj = healthDocObj;
const statsDocObj = (statsPath) => {
    return {
        Stats: [
            {
                method: 'get',
                path: statsPath,
                description: 'Request stats for micro service',
                params: [],
                bodyParams: [],
                success: [],
                successExample: 'Success Response:\n' +
                    '     HTTP/1.1 200 OK\n' +
                    '     {\n' +
                    '       "message": "Request statistics",\n' +
                    '       "stats": {\n' +
                    '       "totalRequests": 7,\n' +
                    '       "statusCounts": {\n' +
                    '         "2xx": 4,\n' +
                    '         "4xx": 3\n' +
                    '       },\n' +
                    '       "pathCounts": {\n' +
                    '         "/": 1,\n' +
                    '         "/...": 1,\n' +
                    '         ...,\n' +
                    '         "/stats": 1\n' +
                    '       },\n' +
                    '       "lastRequestTime": "20XX-01-01T20:54:19.373Z",\n' +
                    '       "responseTimes": [5, 1, 0, 7, 7, 6, 0],\n' +
                    '       "avgResponseTime": 3.7142857142857144\n' +
                    '       }\n' +
                    '     }',
                error: 'No stats available',
                errorExample: 'Error-Response:\n' +
                    '     HTTP/1.1 503 Service unavailable'
            }
        ]
    };
};
exports.statsDocObj = statsDocObj;
const replaceMacro = (text, vars) => {
    let result = text;
    for (let varName in vars) {
        if (vars.hasOwnProperty(varName)) {
            result = result.replace(new RegExp('{{' + varName + '}}', "gm"), vars[varName]);
        }
    }
    return (result);
};
const createHtml = (apiDocObj) => {
    let html = '';
    apiDocObj = orderApiObj(apiDocObj);
    const htmlBody = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    html {
      box-sizing: border-box;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      font-family: Helvetica, Calibri, "Myriad Pro", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Tahoma, Geneva, Arial, sans-serif;
      font-weight: 300;
    }

    body {
      color: #334455;
      background: white;
      padding: 0 1em 1em;
    }

    h1 {
      margin: 0;
      line-height: 2;
      text-align: center;
    }

    h2 {
      margin: 0 0 .5em;
      font-weight: normal;
    }

    .group-label {
      font-weight: 600;
      font-size: 24px;
      padding: 1rem 0;
    }

    input {
      position: absolute;
      opacity: 0;
      z-index: -1;
    }

    /* Accordion styles */
    .tabs {
      border-radius: 8px;
      overflow: hidden;
      /* box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.5); */
    }

    .tab {
      width: 99.8%;
      color: #334455;
      overflow: hidden;
      margin: 6px 0;
    }
    .tab-get {
      border: 1px solid #8899ff;
    }

    .tab-post {
      border: 1px solid #44aa33;
    }

    .tab-delete {
      border: 1px solid #dd6655;
    }

    .tab-put {
      border: 1px solid #ddcc55;
    }

    .tab-label {
      display: flex;
      /* justify-content: space-between; */
      padding: 0.5em;
      background: #f2f5f8;
      cursor: pointer;
    }

    .method {
      margin: 2px 4px;
      padding: 7px 16px 0px 16px;
      width: 90px;
      text-align: center;
      font-weight: bold;
      color: white;
      border-radius: 3px;
    }

    .path {
      padding: 0.5rem 1rem;
      font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .description {
      padding: 0.65rem 0rem;
      font-size: 0.8rem;
      margin-right: auto;
    }

    .lock {
      height: 30px;
      width: 30px;
      margin-top: 8px;
    }

    .get {
      background-color: rgb(82, 115, 207);

    }

    .post {
      background-color: rgb(125, 187, 66);

    }

    .put {
      background-color: rgb(221, 173, 83);

    }

    .delete {
      background-color: rgb(184, 84, 84);

    }

    /* Icon */
    .tab-label:hover {
      background: #e4e7ea;
    }

    .tab-label::after {
      content: "\\276F";
      width: 1em;
      height: 1em;
      text-align: center;
      transition: all .35s ease-in-out;
      margin: 0.5rem 4px;
      /* margin-left: auto; */
      font-size: 1.1rem;
    }


    .tab-content {
      max-height: 0;
      padding: 0 1em;
      color: #334455;
      background: white;
      transition: all .35s;
      border: none;
    }

    .tab-close {
      display: flex;
      justify-content: flex-end;
      padding: 1em;
      font-size: 0.75em;
      background: #334455;
      cursor: pointer;
    }

    .tab-close:hover {
      background: #223344;
    }

    input:checked+.tab-label {
      background: #dadcde;
    }

    input:checked+.tab-label::after {
      transform: rotate(90deg);
    }

    input:checked~.tab-content {
      max-height: 100vh;
      padding: 1em;
      border: 1px solid #ccc;
    }

    table {
      padding: 0.6rem 0;
    }

    th {
      text-align: left;
    }

    .params,
    .paramsExample {
      background-color: rgb(240, 248, 255);
      padding: 0.3rem 0.5rem;
      border-bottom: 8px solid #fff;
    }

    .success,
    .successExample {
      background-color: rgb(243, 255, 238);
      padding: 0.3rem 0.5rem;
      border-bottom: 8px solid #fff;
    }

    .successExample {}

    .error,
    .errorExample {
      background-color: rgb(255, 243, 240);
      padding: 0.3rem 0.5rem;
      border-bottom: 8px solid #fff;
    }

    .errorExample {}

    .param-name {
      width: 20%;
      vertical-align: top;
    }

    .param-type {
      width: 10%;
      font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .param-default {
      background-color: rgb(66, 108, 187);
      border-radius: 2px;
      color: white;
      font-size: 0.9rem;
      padding: 1px 5px;
    }

    .param-optional {
      background-color: olivedrab;
      border-radius: 2px;
      color: white;
      font-size: 0.9rem;
      padding: 1px 5px;
    }

    .param-mandatory {
      background-color: rgb(187, 66, 66);
      border-radius: 2px;
      color: white;
      font-size: 0.9rem;
      padding: 1px 5px;
    }

    .param-desc {
      color: #808488;
    }

    .success-color {
      color: rgb(125, 187, 66)
    }

    .error-color {
      color: rgb(187, 66, 66)
    }

    .primary-color {
      color: rgb(66, 108, 187)
    }

    pre {
      margin: 0;
    }
  </style>
</head>
<body>
    <h1>API Documentation</h1>
    {{GROUPS}}
</body></html>
`;
    const htmlGroup = `
  <div class="group">
    <div class="group-label">
      {{GROUPLABEL}}
    </div>
    <div class="tabs">
      {{TABS}}
    </div>
  </div>
  `;
    const htmlTab = `
      <div class="tab tab-{{METHODSMALL}}">
        <input type="checkbox" id="chck{{ID}}">
        <label class="tab-label" for="chck{{ID}}">
          <div class="method {{METHODSMALL}}">
            {{METHOD}}
          </div>
          <div class="path">
            {{PATH}}
          </div>
          <div class="description">
            {{DESCRIPTION}}
          </div>
          {{LOCK}}
        </label>
        <div class="tab-content">
          {{PARAMS}}
          {{PARAMSEXAMPLE}}
          {{SUCCESS}}
          {{SUCCESSEXAMPLE}}
          {{ERROR}}
          {{ERROREXAMPLE}}
        </div>
      </div>
  `;
    const htmlLock = `<svg class="lock"><path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z" fill="#aaa"></path></svg>`;
    const htmlSuccessExample = `          <div class="successExample">
            <table width="100%">
              <tr>
                <td class="param-name">Example</td>
                <td class="param-desc">
                  <pre>
{{SUCCESSEXAMPLE}}</pre>
                </td>
              </tr>
            </table>
          </div>
`;
    const htmlParamsExample = `          <div class="paramsExample">
            <table width="100%">
              <tr>
                <td class="param-name">Example</td>
                <td class="param-desc">
                  <pre>
{{PARAMSEXAMPLE}}</pre>
                </td>
              </tr>
            </table>
          </div>
`;
    const htmlErrorExample = `<div class="errorExample">
            <table width="100%">
              <tr>
                <td class="param-name">Example</td>
                <td class="param-desc">
                  <pre>
{{ERROREXAMPLE}}</pre>
                </td>
              </tr>
            </table>
          </div>`;
    const htmlError = `<div class="error">
            <table width="100%">
              <tr>
                <th class="param-name error-color">Error - 4xx</th>
                <td>{{ERROR}}</td>
              </tr>
            </table>
          </div>`;
    const htmlSuccess = `          <div class="success">
            <table width="100%">
              <tr>
                <th colspan="3" class="success-color">Success - 200</th>
              </tr>
              {{SUCCESSPARAMS}}
            </table>
          </div>
`;
    const htmlParamLines = `              <tr>
                <td class="param-name">{{NAME}}</td>
                <td class="param-type">{{TYPE}}</td>
                <td class="param-desc">{{DESCRIPTION}}</td>
              </tr>
`;
    const htmlParams = `          <div class="params">
            <table width="100%">
              <tr>
                <th colspan="3" class="primary-color">{{PARAMTYPE}}</th>
              </tr>
              {{PARAMS}}
            </table>
          </div>
`;
    const htmlOptional = ` <span class='param-optional'>optional</span>`;
    const htmlDefault = ` <span class='param-default'>default: {{DEFAULTVALUE}}</span>`;
    let id = 1;
    let groups = '';
    for (let varName in apiDocObj) {
        if (apiDocObj.hasOwnProperty(varName)) {
            const groupObj = apiDocObj[varName];
            let tabs = '';
            groupObj.forEach((endpoint) => {
                var _a, _b, _c;
                let params = '';
                if ((_a = endpoint.params) === null || _a === void 0 ? void 0 : _a.length) {
                    let queryParams = '';
                    endpoint.params.forEach((queryParam) => {
                        let description = queryParam.description ? queryParam.description : '';
                        if (!queryParam.mandatory) {
                            description += htmlOptional;
                        }
                        if (queryParam.default) {
                            description += replaceMacro(htmlDefault, { DEFAULTVALUE: queryParam.default });
                        }
                        queryParams = queryParams + replaceMacro(htmlParamLines, {
                            NAME: queryParam.name ? queryParam.name : '',
                            TYPE: queryParam.type ? queryParam.type : '',
                            DESCRIPTION: description
                        });
                    });
                    params = replaceMacro(htmlParams, { PARAMTYPE: endpoint.method.toLowerCase() === 'get' ? 'Query Parameters' : 'Body Parameters', PARAMS: queryParams });
                }
                if ((_b = endpoint.bodyParams) === null || _b === void 0 ? void 0 : _b.length) {
                    let bodyParams = '';
                    endpoint.bodyParams.forEach((bodyParam) => {
                        let description = bodyParam.description ? bodyParam.description : '';
                        if (!bodyParam.mandatory) {
                            description += htmlOptional;
                        }
                        if (bodyParam.default) {
                            description += replaceMacro(htmlDefault, { DEFAULTVALUE: bodyParam.default });
                        }
                        bodyParams = bodyParams + replaceMacro(htmlParamLines, {
                            NAME: bodyParam.name ? bodyParam.name : '',
                            TYPE: bodyParam.type ? bodyParam.type : '',
                            DESCRIPTION: description
                        });
                    });
                    params = replaceMacro(htmlParams, { PARAMTYPE: 'Body Parameters', PARAMS: bodyParams });
                }
                let success = '';
                if ((_c = endpoint.success) === null || _c === void 0 ? void 0 : _c.length) {
                    let successParams = '';
                    endpoint.success.forEach((successParam) => {
                        successParams = successParams + replaceMacro(htmlParamLines, {
                            NAME: successParam.name ? successParam.name : '',
                            TYPE: successParam.type ? successParam.type : '',
                            DESCRIPTION: successParam.description ? successParam.description : '',
                        });
                    });
                    success = replaceMacro(htmlSuccess, { SUCCESSPARAMS: successParams });
                }
                const macroVars = {
                    ID: id,
                    METHODSMALL: endpoint.method ? endpoint.method.toLowerCase() : '',
                    METHOD: endpoint.method ? endpoint.method.toUpperCase() : '',
                    PATH: endpoint.path ? endpoint.path : '',
                    DESCRIPTION: endpoint.description ? endpoint.description : '',
                    LOCK: endpoint.secure ? htmlLock : '',
                    PARAMS: params,
                    PARAMSEXAMPLE: endpoint.paramsExample ? replaceMacro(htmlParamsExample, { PARAMSEXAMPLE: endpoint.paramsExample }) : '',
                    SUCCESS: success,
                    SUCCESSEXAMPLE: endpoint.successExample ? replaceMacro(htmlSuccessExample, { SUCCESSEXAMPLE: endpoint.successExample }) : '',
                    ERROR: endpoint.error ? replaceMacro(htmlError, { ERROR: endpoint.error }) : '',
                    ERROREXAMPLE: endpoint.errorExample ? replaceMacro(htmlErrorExample, { ERROREXAMPLE: endpoint.errorExample }) : ''
                };
                tabs = tabs + replaceMacro(htmlTab, macroVars);
                id++;
            });
            groups = groups + replaceMacro(htmlGroup, { GROUPLABEL: varName, TABS: tabs });
        }
    }
    html = replaceMacro(htmlBody, { GROUPS: groups });
    return html;
};
exports.createHtml = createHtml;
//# sourceMappingURL=apiDoc.js.map