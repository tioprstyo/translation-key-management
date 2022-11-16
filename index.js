/* eslint no-prototype-builtins: "error" */
const fs = require('fs')
const fetch = require('node-fetch')

const translate = async (args) => {
    if(args) {
        let pagesResponse = [];
        let pagesGID = [];
        try {
            if(args.isMultipleSheet) {
                const responsePages = await fetch(`${args.sheetURL}/pub?gid=${args.gid.mainSheets}&single=true&output=tsv`)
                pagesResponse = (await responsePages.text()).split('\n').slice(1)
                pagesResponse.map(e => {                    
                    pagesGID.push({
                        page: e.split('\t')[0].replace(/(?:\\[r]|[\r]+)+/g, ''),
                        gid: e.split('\t')[1].replace(/(?:\\[r]|[\r]+)+/g, '')
                    })
                });
            } else {
                pagesGID.push(args.gid.sheets);
            }

            pagesGID.forEach((pageId) => {
                const {page, gid} = pageId
                const getLang = async () => {
                    const response = await fetch(`${args.sheetURL}/pub?gid=${gid}&single=true&output=tsv`
                    )
                    const langResponse = (await response.text()).split('\n')
                    const keyStore = {}
                    const langs = langResponse[0].split('\t').slice(1)
                    langs.forEach((lang, index) => {
                        const langId = lang.replace(/(?:\\[r]|[\r]+)+/g, '')
                        keyStore[langId] = {}
                        let resultJSON = {}
                        langResponse.slice(1).forEach((key) => {
                            const keyLine = key.split('\t')
                            const value = keyLine[index + 1].replace(/(?:\\[r]|[\r]+)+/g, '')

                            const makeObj = (arry, initValue) => {
                                let text = initValue
                                let obj = {}
                                const objRef = obj
                                let idx = 0
                                while (idx < arry.length - 1) {
                                    obj[arry[idx]] = {}
                                    obj = obj[arry[idx]]
                                    idx++
                                }
                                if (text && text.includes('|')) {
                                    const newText = []
                                    text = text.split('|')
                                    text.map((tx) => {
                                        newText.push({
                                            [tx.split('\\')[0].split('_')[0]]: tx
                                                .split('\\')[0]
                                                .split('_')[1],
                                            [tx.split('\\')[2].split('_')[0]]: tx
                                                .split('\\')[2]
                                                .split('_')[1]
                                        })
                                        return tx
                                    })
                                    text = newText
                                }
                                obj[arry[idx]] = text
                                return objRef
                            }

                            const merge = (...arg) => {
                                const target = {}
                                const merger = (obj) => {
                                    for (const prop in obj) {
                                        if (Object.hasOwnProperty.call(obj, prop)) {
                                            if (
                                                Object.prototype.toString.call(obj[prop]) ===
                                                '[object Object]'
                                            ) {
                                                target[prop] = merge(target[prop], obj[prop])
                                            } else {
                                                target[prop] = obj[prop]
                                            }
                                        }
                                    }
                                }
                                for (let i = 0; i < arg.length; i++) {
                                    merger(arg[i])
                                }
                                return target
                            }
                            resultJSON = merge(
                                resultJSON,
                                makeObj(keyLine[0].split('_'), value)
                            )
                            keyStore[langId] = resultJSON
                        })
                    })

                    Object.entries(keyStore).forEach(([key, value]) => {
                        fs.mkdirSync(`lang/${key}`, { recursive: true })
                        fs.writeFileSync(
                            `lang/${key}/${page}.ts`,
                            `export default ${JSON.stringify(value, null, 2)}`,
                            () => {}
                        )

                        let indexing = ''
                        pagesResponse.map((e) => {
                            indexing =
                                indexing +
                                `export { default as ${e.split('\t')[0]} } from './${
                                    e.split('\t')[0]
                                }'\r\n`
                            return e
                        })
                        fs.writeFileSync(`lang/${key}/index.ts`, indexing, () => {})
                    })
                }
                getLang()
            })
        } catch (err) {
            console.log(err) // eslint-disable-line no-console
        }
    } else {
        console.log('Please set your config')
    }
}

module.exports = translate(args);
