class TestTable {
    constructor() {this._tsvs=[];this._el=null;}
    clear(){this._tsvs.length=0}
    addTsv(tsv) { this._tsvs.push(tsv) }
    get el() {return this.#make()}
    #make() {
        const table = this.#makeTable()
        for (let tsv of this._tsvs) {
            for (let [input, expected, actual] of tsv) {
                table.append(this.#makeLine(input, expected, actual))
            }
        }
        return table
    }
    #makeTable() {
        const table = document.createElement('table')
        const tr = this.#makeTr()
        tr.append(...['簡易構文','表示','HTML'].map(t=>this.#makeTh(t)))
        table.append(tr)
        return table
    }
    #makeLine(input, expected, actual) {
        const tr = this.#makeTr()
        if (expected!==actual) {tr.style.backgroundColor='red'}
        tr.append(
            this.#makeTdTa(input, true),
            //this.#makeTd(expected),
            this.#makeTd(actual),
            this.#makeTdTa(actual, true),
        )
        return tr
    }
    #makeTr() {
        const tr = document.createElement('tr')
        return tr
    }
    #makeTh(text) {
        const th = document.createElement('th')
        th.innerText = text
        return th
    }
    #makeTd(text) {
        const td = document.createElement('td')
        td.innerHTML = text
        return td
    }
    #makeTdTa(text, isReadOnly=false, isResize=false, isSanitize=false) {
        const td = document.createElement('td')
        td.appendChild(this.#makeTextArea(text, isReadOnly, isResize, isSanitize))
        return td
    }
    #makeTextArea(text, isReadOnly=false, isResize=false, isSanitize=false) {
        const textarea = document.createElement('textarea')
        textarea.value = isSanitize ? Sanitizor.encode(text) : text
        if (isReadOnly) { textarea.readOnly = true }
        if (!isResize) { textarea.style.resize = 'none' }
        textarea.addEventListener('focus', (e)=>{e.target.setSelectionRange(0, e.target.value.length);e.target.scrollTo(0,0);Clipboard.write(e.target.value);})
        return textarea
    }
}
// クリップボードへコピー（コピーの処理）
class Clipboard {
    static write(text) {
        if (navigator.clipboard) { return navigator.clipboard.writeText(text).then(()=>{this.#showMessage()}) }
        else { document.execCommand('copy'); this.#showMessage(); }
    }
    static #showMessage() {
        const el = this.#addMessage()
        el.style.display = 'block'
        setTimeout(()=>{el.style.display='none'}, 2000)
    }
    static #addMessage() {
        const id = `clipboard-copy-message`
        let el = document.querySelector(`#${id}`)
        if (!el) {
            el = document.createElement('p')
            el.id = id
            el.innerText = 'クリップボードにコピーしました！'
            el.style.backgroundColor = 'yellow'
            el.style.zIndex = 'calc(infinity)'
            el.style.position = 'fixed'
            el.style.top = '0'
            el.style.left = '50%'
            document.body.append(el)
        }
        return el
    }
}
// サニタイズ
class Sanitizor {
    static encode(str) {return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') }
    static decode(str) {return str.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,'\'').replace(/&amp;/g,'&') }
}

