;(function(){
class RubyParser { static parse(src) { return ShortRubyParser.parse(LongRubyParser.parse(src)) } }
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
    }
    static twin(rb, rt, isUnder=false) { // 上下単一ずつ全体ルビ  ｜あ山い《うえ↓した》
        const keys = [...rt.matchAll(/[↑↓]/g)]
        if (1!==keys.length) {}
        if (0===keys.length) {console.warn(`ルビに↑か↓が一つ必要です。rt:${rt}`)}
        if (1 < keys.length) {console.warn(`ルビの↑や↓が複数あります。一つだけ許容します。rt:${rt}`)}
        const first = rt.slice(0, keys[0].index)
        const last = rt.slice(keys[0].index+keys[0].length)
        return this.nest(rb, first, last, isUnder)
    }
    static pipes(match, rbA, rtA, isUnder=false) { // 親文字とルビ文字は共に｜で区切られているパターン
        const pos = {
            first: (!isUnder && rtA.pipes.length <= rbA.pipes.length) ? '' : (isUnder ? 'under' : 'over'),
            last: isUnder ? 'over' : 'under',
        }
        /*
        console.log(`pipes: rb${rbA.pipes} rt:${rtA.pipes} isUnder:${isUnder} pos:`, pos)
        if (rtA.pipes.length < rbA.pipes.length) {
            console.warn(`親文字が漢字と｜だけの場合、ルビ文字に同数か+1の｜が必要。rb:${rbA.pipes.length} rt:${rtA.pipes.length} 対象文:${match}`)
            return match
        }
        */
        const btState = rbA.pipes.length === rtA.pipes.length ? '=' : (rbA.pipes.length < rtA.pipes.length ? '<' : '>')
        const loopNum = '>'===btState ? rtA.pipes.length : rbA.pipes.length
        let errMsg = ''
        if ('='!==btState) {errMsg += `親文字が漢字と｜だけの場合、ルビ文字に同数か+1の｜が必要。rb:${rbA.pipes.length} rt:${rtA.pipes.length} 対象文:${match}\n${'<'===btState ? '超過したルビは無視します。' : '不足したルビは親文字をそのまま出力します。'}`}
        console.log(`btState:${btState}`)

        const htmls = []
        //for (let i=0; i<rbA.pipes.length; i++) {
        for (let i=0; i<loopNum; i++) {
            htmls.push(Html.solo(rbA.pipes[i], rtA.pipes[i], pos.first))
        }

        // ルビが不足している残りの親文字をそのまま出力する
        if ('>'===btState) { for (let i=loopNum; i<rbA.pipes.length; i++) { htmls.push(rbA.pipes[i]) } }

        if (rbA.pipes.length < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.pipes.length], pos.last) }
        else {return htmls.join('')}
    }
    static kanjis(match, rbA, rtA, posId='') { // ルビ文字は,で区切られているパターン（親文字はすべて漢字）
        const POS = posId.toLowerCase()
        if (!['','under','over'].some(v=>v===POS)){throw new Error(`プログラムエラー`)}
        const pos = {
            first: POS,
            last: POS==='under' ? 'over' : 'under',
        }
        const btState = rbA.kanjis.length === rtA.commas[0].length ? '=' : (rbA.kanjis.length < rtA.commas[0].length ? '<' : '>')
        const loopNum = '>'===btState ? rtA.commas[0].length : rbA.kanjis.length
        let errMsg = ''
        if ('='!==btState) {errMsg += `ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}\n${'<'===btState ? '超過したルビは無視します。' : '不足したルビは親文字をそのまま出力します。'}`}
        console.log(`btState:${btState}`)

        // 親文字とルビ文字のペアを連続生成する
        const htmls = []
        for (let i=0; i<loopNum; i++) {
            htmls.push(Html.solo(rbA.kanjis[i].text, rtA.commas[0][i], pos.first))
        }

        // ルビが不足している残りの親文字をそのまま出力する
        if ('>'===btState) { for (let i=loopNum; i<rbA.kanjis.length; i++) { htmls.push(rbA.kanjis[i].text) } }

        if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[1], pos.last) }
        else {return htmls.join('')}
    }
    static kanjiGroups(match, rb, rt, rbA, rtA, isUnder=false) {// 親文字は漢字とそれ以外が混在しておりルビ文字は｜で区切られている
        const pos = {
            first: (rbA.kanjiGroups.length < rtA.pipes.length) ? (isUnder ? 'under' : 'over') : '',
            last: isUnder ? 'over' : 'under',
        }
        const kanG = rbA.kanjiGroups
        if (1 < kanG.length) {
            // 漢字群とそれ以外との境界で各要素に分割した配列を作る
            const alls = []
            let [start, end] = [0,0]
            for (let kanji of kanG) {
                if (end < kanji.start) {
                    alls.push({text:rb.slice(start, kanji.start), isKanji:false})
                }
                alls.push({text:kanji.text, isKanji:true})
                start = kanji.end
                end = kanji.end
            }
            if (kanG[kanG.length-1].end < rb.length-1) {
                alls.push({text:rb.slice(kanG[kanG.length-1].end), isKanji:false})
            }
            // 漢字群とルビ群はHTML化し、非漢字はそのまま出力する
            const htmls = []
            let kanjiCount = 0
            for (let parts of alls) {
                if (parts.isKanji) {
                    if (kanjiCount < kanG.length && kanjiCount < rtA.pipes.length) {
                        htmls.push(rtA.has.commas[kanjiCount]
                            ? Html.kanjis(match, Analizer.rb(kanG[kanjiCount].text), Analizer.rt(rtA.pipes[kanjiCount]), pos.first)
                            : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
                    } else if (kanjiCount < kanG.length) { htmls.push(kanG[kanjiCount].text) } // 漢字そのまま
                    else {throw new Error(`プログラムエラー。`)}
                    kanjiCount++;
                } else {htmls.push(parts.text)} // 非漢字そのまま
            }
            // 漢字群よりルビ群のほうが多ければ、下ルビを付ける
            if (kanjiCount < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[kanjiCount], pos.last) }
            else {return htmls.join('')}
        } else { return Html.solo(rb, rt, pos.first) }
    }
}
class Analizer {
    static #KANJI_S = RegExp('[一-龠々仝〆〇ヶ]', 'g')
    static #KANJI_G = RegExp('[一-龠々仝〆〇ヶ]{1,}', 'g')
    static rt(src) {
        const pipes = src.split('｜')
        const commas = pipes.map(pipe=>pipe.split(','))
        return {
            pipes: pipes,
            commas: commas,
            has: {
                pipe: 1 < pipes.length,
                commas: commas.map(c=>1<c.length),
            }
        }
    }
    static rb(src) {
        const pipes = src.split('｜')
        const kanjis = this.kanjis(src)
        const kanjiGroups = this.kanjis(src, true)
        return {
            pipes: pipes,
            kanjis: kanjis,
            kanjiGroups: kanjiGroups,
            has: {
                kanji: 0 < kanjis.length,
                pipe: 1 < pipes.length,
            }
        }
    }
    static kanjis(src, isGroup=false) {
        const kanjis = []
        const KANJI = RegExp(`[一-龠々仝〆〇ヶ]${isGroup ? '{1,}' : ''}`, 'g')
        let match = null
        while ((match = KANJI.exec(src)) !== null) {
            kanjis.push({text:match[0], start:match.index, end:KANJI.lastIndex})
        }
        return kanjis
    }
}
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #toHtml(match, rb, rt) {
        const rtA = Analizer.rt(rt)
        if (rtA.has.commas[0]) { return Html.kanjis(match, Analizer.rb(rb), rtA) }//漢字一字ずつルビ。任意で下にも。
        else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1]) } // 上下に一つずつルビを振る
        else { return Html.solo(rb, rt) } // 上に一つルビを振る
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(match, rb, rt) }) }
}
class LongRubyParser {
    static #LONG = /([｜↓])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g
    static #soloPos(pos, isManyRt=false) { return !isManyRt && 'over'===pos ? '' : pos }
    static #toHtml(match, D, rb, rt) {
        const isUnder = '↓'===D
        const pos = {
            first: '↓'===D ? 'under' : 'over', // 漢字群の読みルビ方向
            last: '↓'===D ? 'over' : 'under',  // 最後(全体)のルビ方向
        }
        const rbA = Analizer.rb(rb)
        const rtA = Analizer.rt(rt)
        console.log(`LONG:`, rbA, rtA, pos, this.#soloPos(pos.first, rtA.has.pipe), rtA.has.commas[0])
        if (rbA.has.kanji && !rbA.has.pipe) { // 親文字＝漢字アリ＋｜ナシ
            // 漢字のみ
            if (rb===rbA.kanjis.map(k=>k.text).join('')) {
                if (rbA.has.pipe && rtA.has.pipe) { return Html.pipes(match, rbA, rtA, isUnder) }  // 部分ルビ
                else { return (rtA.has.commas[0])
                    ? Html.kanjis(match, rbA, rtA, this.#soloPos(pos.first, rtA.has.pipe)) // 一字ルビ
                    : Html.solo(rb, rt, this.#soloPos(pos.first, rtA.has.pipe)) } // 全体ルビ
            }
            // 字種不問
            else {
                // 全体ルビ
                // 漢字群のみルビ
                if (1 < rbA.kanjiGroups.length && rtA.has.pipe) { // 漢字群のみルビ ｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》
                    console.log(`字種不問＋漢字群のみルビ`)
                    return Html.kanjiGroups(match, rb, rt, rbA, rtA, isUnder)
                } else if (!rtA.has.pipe && ['↑','↓'].some(s=>rt.includes(s))) { // 上下全体ルビ ｜あ山い《うえ↓した》
                    return Html.twin(rb, rt, isUnder)
                } else { // 全体単一ルビ  ｜あ山い《うえ》  ↓あ山い《した》
                    return Html.solo(rb, rt, this.#soloPos(pos.first))
                }
            }
        } else if (rbA.has.pipe) { // 親文字に漢字がないのに｜はある
            return Html.pipes(match, rbA, rtA, isUnder)
        } else { // 親文字に漢字も｜もない
            console.log(`親文字に漢字も｜もない`)
            const POS = isUnder ? 'under' : ''
            if (['｜',','].every(s=>rt.includes(s))) { return Html.nest(rb, rtA.pipes[0].replaceAll(',',''), rtA.pipes[1].replaceAll(',',''), isUnder) }
            else if (rt.includes(',')) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
            else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder) } 
            else { console.log(`ルビ文字に漢字も｜もない: rb:${rb} rt:${rt}`); return Html.solo(rb, rt, POS) } // ルビに｜,ナシ
        }
    }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}
window.RubyParser = RubyParser;
})();
