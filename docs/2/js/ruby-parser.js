class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #toHtml(rb, rt) {
        if (rt.includes('｜')) {
            const rts = rt.split('｜')
            return `<ruby style="ruby-position:under;"><ruby style="ruby-position:over;">${rb}<rp>（</rp><rt>${rts[0]}</rt><rp>）</rp></ruby><rp>（</rp><rt>${rts[1]}</rt><rp>）</rp></ruby>`
        } else { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
       
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    //static parse(src) { return this.#SHORT.reduce((src, reg)=>this.#ruby(src, reg), src) }
    //static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
}
class LongRubyParser {
    static #LONG = /([｜↓])([^｜《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g
//    static #LONG = /｜([^｜《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g
    static #toHtml(D, rb, rt) {
        const dir = {
            first: '↓'===D ? 'under' : 'over', // 漢字群の読みルビ方向
            last: '↓'===D ? 'over' : 'under',  // 最後(全体)のルビ方向
        }
        const rts = rt.split('｜')
        // rbの中から漢字群だけを抽出する
        const KANJI = RegExp('[一-龠々仝〆〇ヶ]{1,}', 'g')
        const kanjis = []
        let match = null
        while ((match = KANJI.exec(rb)) !== null) {
            kanjis.push({text:match[0], start:match.index, end:KANJI.lastIndex})
        }
        //if (rt.includes('｜')) {
        if (1 < kanjis.length) {
            // 漢字群とそれ以外との境界で各要素に分割した配列を作る
            const alls = []
            let [start, end] = [0,0]
            for (let kanji of kanjis) {
                if (end < kanji.start) {
                    alls.push({text:rb.slice(start, kanji.start), isKanji:false})
                }
                alls.push({text:kanji.text, isKanji:true})
                start = kanji.end
                end = kanji.end
            }
            if (kanjis[kanjis.length-1].end < rb.length-1) {
                alls.push({text:rb.slice(kanjis[kanjis.length-1].end), isKanji:false})
            }
            // 漢字群とルビ群はHTML化し、非漢字はそのまま出力する
            const htmls = []
            let kanjiCount = 0
            for (let parts of alls) {
                if (parts.isKanji) {
                    if (kanjiCount < kanjis.length && kanjiCount < rts.length) {
                        //htmls.push(`<ruby style="ruby-position:over;">${kanjis[kanjiCount].text}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>`)
                        htmls.push(`<ruby style="ruby-position:${dir.first};">${kanjis[kanjiCount].text}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>`)
                    } else if (kanjiCount < kanjis.length) { htmls.push(kanjis[kanjiCount].text) } // 漢字そのまま
                    else {throw new Error(`プログラムエラー。`)}
                    kanjiCount++;
                } else {htmls.push(parts.text)} // 非漢字そのまま
            }
            // 漢字群よりルビ群のほうが多ければ、下ルビを付ける
            //if (kanjiCount < rts.length) { return `<ruby style="ruby-position:under;">${htmls.join('')}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>` }
            if (kanjiCount < rts.length) { return `<ruby style="ruby-position:${dir.last};">${htmls.join('')}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>` }
            else {return htmls.join('')}
        //} else { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
        } else { return `<ruby${('over'===dir.first) ? '' : ' style="ruby-position:under;"'}>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(D, rb, rt) }) }
    //static parse(src) { return this.#LONG.reduce((src, reg)=>this.#ruby(src, reg), src) }
    //static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
}

/*
class UnderShortRubyParser { // 違いは次の二点のみ　｜→↓、over/under 
    static #SHORT = /↓([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #toHtml(rb, rt) {
        if (rt.includes('｜')) {
            const rts = rt.split('｜')
            return `<ruby style="ruby-position:over;"><ruby style="ruby-position:under;">${rb}<rp>（</rp><rt>${rts[0]}</rt><rp>）</rp></ruby><rp>（</rp><rt>${rts[1]}</rt><rp>）</rp></ruby>`
        } else { return `<ruby style="ruby-position:under;">${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    //static parse(src) { return this.#SHORT.reduce((src, reg)=>this.#ruby(src, reg), src) }
    //static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
}
class LongOneRubyParser {
    static #LONG = /｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
    static #toHtml(rb, rt) {
        return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`
    }
    static parse(src) { return src.replace(this.#LONG, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    //static parse(src) { return this.#LONG.reduce((src, reg)=>this.#ruby(src, reg), src) }
    //static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
}
*/
/*
class UnderLongRubyParser {
    static #LONG = /↓([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
    static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    static #toHtml(rb, rt) {
        return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`
    }
    static parse(src) { return this.#LONG.reduce((src, reg)=>this.#ruby(src, reg), src) }
}
class RubyParaser {
    parse(src) { return [this.#LONG, this.#SHORT].reduce((src, reg)=>this.#ruby(src, reg), src) }
    parse(src) { return [LongRubyParser,ShortRubyParser].reduce((src, reg)=>this.#ruby(src, reg), src) }
    
    .parse(src)
}
*/
/*
    class RubyParser {
        //#SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g
        #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g
        //#SHORT = /([一-龠々仝〆〇ヶ]{1,50})[^｜]《([^｜《》\n\r]{1,20})》/g
        #LONG = /｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
        #ESCAPE = /｜《/g
        parse(src) { return [this.#LONG, this.#SHORT].reduce((src, reg)=>this.#ruby(src, reg), src) }
        //parse(src) { return this.#escape([this.#LONG, this.#SHORT].reduce((src, reg)=>this.#ruby(src, reg), src)) }
//        parse(src) { return this.#escape([this.#LONG, this.#SHORT].reduce((src, reg)=>
//                src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }), src)) }
        escape(src) { return src.replace(this.#ESCAPE, (match)=>'《') }
        #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
        #toHtml(rb, rt) { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
*/
/*
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g;
    static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    static #toHtml(rb, rt) { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    static parse(src) { return this.#SHORT.reduce((src, reg)=>this.#ruby(src, reg), src) }
}
class LongRubyParser {
    static #LONG = /｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
    static #ruby(src, reg) { console.log(src, reg); return src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
    static #toHtml(rb, rt) { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    static parse(src) { return this.#LONG.reduce((src, reg)=>this.#ruby(src, reg), src) }
}
class RubyParaser {
    parse(src) { return [this.#LONG, this.#SHORT].reduce((src, reg)=>this.#ruby(src, reg), src) }
    parse(src) { return [LongRubyParser,ShortRubyParser].reduce((src, reg)=>this.#ruby(src, reg), src) }
    
    .parse(src)
}
*/


