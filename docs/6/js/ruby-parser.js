;(function(){
//class RubyParser { static parse(src) { return ShortRubyParser.parse(LongRubyParser.parse(src)) } }
//class RubyParser { static parse(src) { return ShortRubyParser.parse(KanjiGroupRubyParser.parse(LongRubyParser.parse(src))) } }
//class RubyParser { static parse(src) { return ShortRubyParser.parse(LongRubyParser.parse(KanjiGroupRubyParser.parse(src))) } }
class RubyParser { static parse(src) { return [KanjiGroupRubyParser,KanjiRubyParser,LongRubyParser,ShortRubyParser].reduce((res,parser)=>parser.parse(res),src) } }
/*
class Parser {
    static parse(rb, rt) {return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`}
}
//function parse(rb, rt) {return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`}
//function parse(rb, rt, isUnder) { return `<ruby${isUnder ? ` style="ruby-position:under;"` : ''}>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
function parse(rb, rt, pos='') {
    const POS = pos.toLowerCase()
    const P = ['','under','over'].some(p=>p===POS) ? POS : ''
    return `<ruby${''===P ? '' : ` style="ruby-position:${P};"`}>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`
}
*/
class Html {
    static #DIRS = [['over','under'],['under','over']]
    static #dirs(isUnder=false) { return this.#DIRS[isUnder ? 1 : 0] }
    static solo(rb, rt, pos='') {
        const POS = pos.toLowerCase()
        const P = ['','under','over'].some(p=>p===POS) ? POS : ''
        return `<ruby${''===P ? '' : ` style="ruby-position:${P};"`}>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>`
    }
    static nest(rb, rtF, rtL, isUnder=false) {
        const d = this.#dirs(isUnder)
        return this.solo(this.solo(rb, rtF, d[0]), rtL, d[1])
        //const [F,L] = [isUnder ? 'over' : 'under', isUnder ? 'under' : 'over']
        //return this.parse(this.parse(rb, rtA.pipes[0], 'over'), rtA.pipes[1], 'under')
        //return this.parse(this.parse(rb, rtF, 'over'), rtL, 'under')
    }
}
class Analizer {
    static rt(src) {
        const pipes = src.split('｜')
        const commas = pipes.map(pipe=>pipe.split(','))
        return {
            pipes: pipes,
            commas: commas,
            has: {
                pipe: 1 < pipes.length,
                //comma: 1 < commas.length,
                commas: commas.map(c=>1<c.length),
            }
        }
    }
    static rb(src) {
        ///[一-龠々仝〆〇ヶ]{1,}/g
        const pipes = src.split('｜')
        const kanjis = [...src.matchAll(/[一-龠々仝〆〇ヶ]/g)].map(m=>m[0])
        const kanjiGroups = [...src.matchAll(/[一-龠々仝〆〇ヶ]{1,}/g)]
        return {
            pipes: src.split('｜'),
            kanjis: kanjis,
            kanjiGroups: kanjiGroups,
            has: {
                kanji: 0 < kanjis.length,
                pipe: 1 < pipes.length,
            }
        }
    }
}
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #toHtml(match, rb, rt) {
        const rtA = Analizer.rt(rt)
        console.log(rtA)
        if (rtA.has.commas[0]) { // 漢字一字ずつルビを振る。任意で下にもルビを振る。
            const rbA = Analizer.rb(rb)
            if (rtA.commas[0].length!==rbA.kanjis.length) {
                console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
                return match
            }
            const htmls = []
            for (let i=0; i<rbA.kanjis.length; i++) {
                //htmls.push(`<ruby>${rbA.kanjis[i]}<rp>（</rp><rt>${rtA.commas[i]}</rt><rp>）</rp></ruby>`)
                //parse(rbA.kanjis[i], rtA.commas[i])
                //htmls.push(parse(rbA.kanjis[i], rtA.commas[i], (1 < rtA.pipes.length) ? 'over' : ''))
                htmls.push(Html.solo(rbA.kanjis[i], rtA.commas[0][i], (1 < rtA.pipes.length) ? 'over' : ''))
            }
            //if (0 < parts.rt.last.length) { return `<ruby style="ruby-position:${dir.last};">${htmls.join('')}<rp>（</rp><rt>${parts.rt.last}</rt><rp>）</rp></ruby>` }
            //if (1 < rtA.pipes.length) { return parse(htmls.join(''), rtA.pipes[rbA.kanjis.length], 'under') }
            if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.kanjis.length], 'under') }
            else {return htmls.join('')}
        }
        else if (rtA.has.pipe) { // 上下に一つずつルビを振る
            return Html.nest(rb, rtA.pipes[0], rtA.pipes[1])
//            return parse(parse(rb, rtA.pipes[0], 'over'), rtA.pipes[1], 'under')
//            const rts = rt.split('｜')
//            return `<ruby style="ruby-position:under;"><ruby style="ruby-position:over;">${rb}<rp>（</rp><rt>${rts[0]}</rt><rp>）</rp></ruby><rp>（</rp><rt>${rts[1]}</rt><rp>）</rp></ruby>`
        }
        else { return Html.solo(rb, rt) }
        //else { return parse(rb, rt) }
        //else { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(match, rb, rt) }) }
}
/*
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r,]{1,20})》/g;
    static #toHtml(rb, rt) {
        if (rt.includes('｜')) {
            const rts = rt.split('｜')
            return `<ruby style="ruby-position:under;"><ruby style="ruby-position:over;">${rb}<rp>（</rp><rt>${rts[0]}</rt><rp>）</rp></ruby><rp>（</rp><rt>${rts[1]}</rt><rp>）</rp></ruby>`
        } else { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
       
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }) }
}
*/
// 親文字(全漢字)を｜で分割する
class KanjiGroupRubyParser { // あ｜鈴木｜一郎《すずき｜いちろう｜イチロー》い      山｜鈴木｜一郎《すずき｜いちろう｜イチロー》川
    static #SHORT = /([｜↓])([一-龠々仝〆〇ヶ｜]{1,50})《([^《》\n\r,]{1,100})》/g;
    static #toHtml(D, rb, rt) {
        if (rt.includes('｜')) {
            const dir = {
                first: '↓'===D ? 'under' : 'over', // 漢字群の読みルビ方向
                last: '↓'===D ? 'over' : 'under',  // 最後(全体)のルビ方向
            }
            const parts = {
                rb: rb.split('｜'),
                rt: rt.split('｜'),
            }
            const MIN = Math.min(parts.rb.length, parts.rt.length)
            const htmls = []
            for (let i=0; i<MIN; i++) {
                htmls.push(`<ruby style="ruby-position:${dir.first};">${parts.rb[i]}<rp>（</rp><rt>${parts.rt[i]}</rt><rp>）</rp></ruby>`)
            }
            if (parts.rb.length < parts.rt.length) { return `<ruby style="ruby-position:${dir.last};">${htmls.join('')}<rp>（</rp><rt>${parts.rt[MIN]}</rt><rp>）</rp></ruby>` }
            else {return htmls.join('')}
        } else { return `<ruby>${rb.replaceAll('｜','')}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    static parse(src) { return src.replace(this.#SHORT, (match, D, rb, rt)=>{ return this.#toHtml(D, rb, rt) }) }
}
// 親文字が漢字のみで、かつルビ内に,がある。（,の数は漢字の文字数-1である）でんでんマークダウン形式
class KanjiRubyParser { // ｜鈴木一郎《すず,き,いち,ろう》　｜鈴木一郎《すず,き,いち,ろう｜イチロー》
    static #SHORT = /([｜↓])([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,100})》/g;
    static #toHtml(match, D, rb, rt) {
        console.log('KANJI')
        if (!rt.includes(',')){return match}
        const dir = {
            first: '↓'===D ? 'under' : 'over', // 漢字群の読みルビ方向
            last: '↓'===D ? 'over' : 'under',  // 最後(全体)のルビ方向
        }
        const rts = rt.split('｜')
        if (rts.length < 2) {rts.push('')}
        const parts = {
            rb: [...rb.matchAll(/[一-龠々仝〆〇ヶ｜]/g)].map(m=>m[0]),
            rt: {
                first: rts[0].split(','),
                last: rts[1],
            }
        }
        if (parts.rb.length !== parts.rt.first.length) {console.error(`rubyの親文字数とルビ要素数が違います。同数にしてください。rb:${parts.rb.length} rt:${parts.rt.first.length}\n${match}`); return match;}
        const MIN = parts.rb.length
        const htmls = []
        const style = (0===parts.rt.last.length && 'over'===dir.first) ? '' : ` style="ruby-position:${dir.first};"`
        for (let i=0; i<MIN; i++) {
            htmls.push(`<ruby${style}>${parts.rb[i]}<rp>（</rp><rt>${parts.rt.first[i]}</rt><rp>）</rp></ruby>`)
        }
        if (0 < parts.rt.last.length) { return `<ruby style="ruby-position:${dir.last};">${htmls.join('')}<rp>（</rp><rt>${parts.rt.last}</rt><rp>）</rp></ruby>` }
        else {return htmls.join('')}
    }
    static parse(src) { return src.replace(this.#SHORT, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}
class LongRubyParser {
    static #LONG = /([｜↓])([^｜《》\n\r]{1,50})《([^《》\n\r,]{1,100})》/g
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
                        htmls.push(`<ruby style="ruby-position:${dir.first};">${kanjis[kanjiCount].text}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>`)
                    } else if (kanjiCount < kanjis.length) { htmls.push(kanjis[kanjiCount].text) } // 漢字そのまま
                    else {throw new Error(`プログラムエラー。`)}
                    kanjiCount++;
                } else {htmls.push(parts.text)} // 非漢字そのまま
            }
            // 漢字群よりルビ群のほうが多ければ、下ルビを付ける
            if (kanjiCount < rts.length) { return `<ruby style="ruby-position:${dir.last};">${htmls.join('')}<rp>（</rp><rt>${rts[kanjiCount]}</rt><rp>）</rp></ruby>` }
            else {return htmls.join('')}
        } else { return `<ruby${('over'===dir.first) ? '' : ' style="ruby-position:under;"'}>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
    }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(D, rb, rt) }) }
}
window.RubyParser = RubyParser;
})();
