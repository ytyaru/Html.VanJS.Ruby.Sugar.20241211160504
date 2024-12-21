class UnitTest {
    static testAll(a) {
        const tables = []
//        const table = new TestTable()
        for (let id of ['RubyShort']) {
            tables.push(this.test(a, id))
//            const tsv = this.#tsv(window[`get${id}s`]())
//            this.#test(a, tsv)
//            table.addTsv(tsv)
        }
//        return table.el
        return tables
    }
    static test(a, id) {
        const table = new TestTable()
        const tsv = this.#tsv(window[`get${id}s`]())
        this.#test(a, tsv)
        table.addTsv(tsv)
        return table.el
    }
    static #test(a, tsv) {
        for (let i=0; i<tsv.length; i++) {
            const [input, expected] = tsv[i]
            const actual = RubyParser.parse(input)
            a.t(()=>actual===expected)
            tsv[i].push(actual)
        }
    }
    static #tsv(text) { return text.split('\n').filter(l=>l).map(l=>{
        const [input, expected] = l.split('\t'); 
        return [input.replaceAll(/\\n/g, '\n').replaceAll(/\\t/g, '\t'), expected]}) }
}

