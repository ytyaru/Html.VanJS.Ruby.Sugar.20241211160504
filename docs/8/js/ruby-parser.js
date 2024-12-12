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
    static kanjis(match, rbA, rtA) { // rb:全漢字
        if (rtA.commas[0].length!==rbA.kanjis.length) {
            console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
            return match
        }
        const htmls = []
        for (let i=0; i<rbA.kanjis.length; i++) {
            htmls.push(Html.solo(rbA.kanjis[i].text, rtA.commas[0][i], (1 < rtA.pipes.length) ? 'over' : ''))
        }
        if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.kanjis.length], 'under') }
        else {return htmls.join('')}
    }
    static pipes(match, rbA, rtA, isUnder=false) { // 親文字とルビ文字は共に｜で区切られているパターン
        const pos = {
            first: (rbA.pipes.length < rtA.pipes.length) ? (isUnder ? 'under' : 'over') : '',
            last: isUnder ? 'over' : 'under',
        }
        if (rbA.pipes.length !== rtA.pipes.length) {
            console.warn(`親文字に漢字がないのに｜がある場合、ルビ文字に同数の｜が必要。rb:${rbA.pipes.length} rt:${rtA.pipes.length} 対象文:${match}`)
            return match
        }
        const htmls = []
        for (let i=0; i<rbA.pipes.length; i++) {
            htmls.push(Html.solo(rbA.pipes[i].text, rtA.pipes[i], pos.first))
        }
        if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.pipes.length], pos.last) }
        else {return htmls.join('')}
    }
    static commas(match, rbA, rtA, isUnder=false) { // ルビ文字は,で区切られているパターン（親文字はすべて漢字）
        const pos = {
            first: (rbA.kanjis.length < rtA.commas[0].length) ? (isUnder ? 'under' : 'over') : '',
            last: isUnder ? 'over' : 'under',
        }
        if (rtA.commas[0].length!==rbA.kanjis.length) {
            console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
            return match
        }
        const htmls = []
        for (let i=0; i<rbA.kanjis.length; i++) {
            htmls.push(Html.solo(rbA.kanjis[i].text, rtA.commas[0][i], (1 < rtA.pipes.length) ? 'over' : ''))
        }
        if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.kanjis.length], 'under') }
        else {return htmls.join('')}
    }
    // commas の ルビ位置直接指定パターン
    static kanjis(match, rbA, rtA, posId='') { // ルビ文字は,で区切られているパターン（親文字はすべて漢字）
        const POS = posId.toLowerCase()
        if (!['','under','over'].some(v=>v===POS)){throw new Error(`プログラムエラー`)}
        const pos = {
            first: POS,
            last: POS==='under' ? 'over' : 'under',
        }
        if (rtA.commas[0].length!==rbA.kanjis.length) {
            console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
            return match
        }
        const htmls = []
        for (let i=0; i<rbA.kanjis.length; i++) {
            htmls.push(Html.solo(rbA.kanjis[i].text, rtA.commas[0][i], pos.first))
        }
        if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.kanjis.length], pos.last) }
        else {return htmls.join('')}
    }

    /*
    static kanjis(match, rbA, rt, isUnder=false) {
        if (rbA.kanjis.length!==rts.length) {
            console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
            return match
        }
        Html.solo(rb, )
    }
    static kanjis(match, rb, rt, isUnder=false) {
//        const rbA = Analizer.rb(rb)
        const rts = rt.split(',')
        if (rbA.kanjis.length!==rts.length) {
            console.warn(`ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。ルビ数:${rtA.commas[0].length} 漢字数:${rbA.kanjis.length} 対象文:${match}`)
            return match
        }
    }
    */
    static kanjiGroups(match, rb, rt, rbA, rtA, isUnder=false) { // 親文字は漢字とそれ以外が混在しておりルビ文字は｜で区切られている
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
//                        htmls.push(Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
//                        htmls.push(rtA.has.commas[kanjiCount] ? Html.solo(rbA.kanjis[kanjiCount].text), Analizer.rt(rtA.pipes[kanjiCount]), isUnder) : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
//                        htmls.push(rtA.has.commas[kanjiCount] ? Html.commas(match, Analizer.rb(kanG[kanjiCount].text), Analizer.rt(rtA.pipes[kanjiCount]), isUnder) : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
                        htmls.push(rtA.has.commas[kanjiCount] ? Html.kanjis(match, Analizer.rb(kanG[kanjiCount].text), Analizer.rt(rtA.pipes[kanjiCount]), pos.first) : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
                        //htmls.push(rtA.has.commas[kanjiCount] ? Html.commas(match, Analizer.rb(kanG[kanjiCount].text), Analizer.rt(rtA.pipes[kanjiCount]), pos.first) : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
//                        htmls.push(rtA.has.commas[kanjiCount] ? Html.commas(match, Analizer.rb(Analizer.kanjis(kanG[kanjiCount].text)), Analizer.rt(rtA.pipes[kanjiCount]), pos.first) : Html.solo(kanG[kanjiCount].text, rtA.pipes[kanjiCount], pos.first))
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
//    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return Html.toShort(match, rb, rt) }) }
//    static #toHtml(match, rb, rt) {return Html.toShort(match, rb, rt)}
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
                //htmls.push(Html.solo(rbA.kanjis[i], rtA.commas[0][i], (1 < rtA.pipes.length) ? 'over' : ''))
                htmls.push(Html.solo(rbA.kanjis[i].text, rtA.commas[0][i], (1 < rtA.pipes.length) ? 'over' : ''))
            }
            if (1 < rtA.pipes.length) { return Html.solo(htmls.join(''), rtA.pipes[rbA.kanjis.length], 'under') }
            else {return htmls.join('')}
        }
        else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1]) } // 上下に一つずつルビを振る
        else { return Html.solo(rb, rt) } // 上に一つルビを振る
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
class LongRubyParser {
    static #LONG = /([｜↓])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g
    //static #soloPos(pos, isManyRt=false) { return isManyRt && 'over'===pos ? '' : pos }
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
        if (rbA.has.kanji) {
            // 漢字のみ
            if (rb===rbA.kanjis.map(k=>k.text).join('')) {
                // 全体ルビ
                // 部分ルビ
                // 一字ルビ
//                console.log(`※※※※漢字のみ`)
//                rbA.kanjis.length < rtA.commas[0].length
                
                if (rbA.has.pipe && rtA.has.pipe) { return Html.pipes(match, rbA, rtA, isUnder) }  // 部分ルビ
                else { return (rtA.has.commas[0])
                        ? rbA.kanjis.map((k,i)=>Html.solo(rbA.kanjis[i], rtA.commas[0][i], this.#soloPos(pos.first, rtA.has.pipe)))
                        : Html.solo(rb, rt, this.#soloPos(pos.first, rtA.has.pipe)) } // 一／全
                //else { return (rtA.has.commas[0]) ? rtA.commas.map((c,i)=>Html.kanjis(rbA.kanjis[i]+c, rbA.kanjis[i], c, isUnder))  : Html.solo(rb, rt, this.#soloPos(pos.first)) } // 一／全
                //else { return (rtA.has.commas[0]) ? Html.commas(match, rbA, rtA, isUnder) : Html.solo(rb, rt, this.#soloPos(pos.first)) } // 一／全
                //else { return (rtA.has.commas[0]) ? Html.commas(match, rbA, rtA, isUnder) : Html.solo(rb, rt, pos.first) } // 一／全
                
              //else { return (rtA.commas.some(c=>c)) ? Html.commas(match, rbA, rtA, isUnder) : Html.solo(rb, rt, pos) } // 一／全
            }
            // 漢字を含む
            else {
                // 全体ルビ
                // 漢字群のみルビ
                if (1 < rbA.kanjiGroups.length) { // 漢字群のみルビ     ｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》
                    return Html.kanjiGroups(match, rb, rt, rbA, rtA, isUnder)
                } else { // 全体ルビ         ｜あ山《よみ｜ヨミ》
//                    return Html.solo(rb, rt, pos.first)
                    return Html.solo(rb, rt, this.#soloPos(pos.first))
                }
            }
        } else if (rbA.has.pipe) { // 親文字に漢字がないのに｜はある
            return Html.pipes(match, rbA, rtA, isUnder)
            /*
            if (rbA.pipes.length !== rtA.pipes.length) {
                console.warn(`親文字に漢字がないのに｜がある場合、ルビ文字に同数の｜が必要。rb:${rbA.pipes.length} rt:${rtA.pipes.length} 対象文:${match}`)
                return match
            }
            if (',' in rt) {
                
            }

            if (['｜',','].every(s=>s in rt)) { return Html.nest(rb, rt.pipes[0].replaceAll(',',''), rt.pipes[1].replaceAll(',',''), isUnder) }
            else if (',' in rt) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), pos) }
            else if (rtA.has.pipe) { return Html.nest(rb, rt.pipes[0], rt.pipes[1], isUnder) } 
            else { return Html.solo(match, rb, rt, pos) } // ルビに｜,ナシ
            */
        } else { // 親文字に漢字も｜もない
            const POS = isUnder ? 'under' : ''
            //if (['｜',','].every(s=>s in rt)) { return Html.nest(rb, rt.pipes[0].replaceAll(',',''), rt.pipes[1].replaceAll(',',''), isUnder) }
            if (['｜',','].every(s=>rt.includes(s))) { return Html.nest(rb, rtA.pipes[0].replaceAll(',',''), rtA.pipes[1].replaceAll(',',''), isUnder) }
            //else if (',' in rt) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
            else if (rt.includes(',')) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
//            if (rtA.has.commas.some(c=>c)) { return Html.solo(rb, rtA.pipes[1]) }
//            if (rtA.has.commas.some(c=>c)) { return Html.solo(Html.kanjis(rb, rtA), rtA.pipes[1]) }
//            if (rtA.has.commas.some(c=>c)) {
                //const first = Html.kanjis(rb, rtA)
//                return Html.solo(Html.kanjis(rb, rtA), rtA.pipes[1])
            else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder) } 
            //} else if (rtA.has.pipe) { return Html.solo(match, rb, rt.replaceAll(/[｜,]/g,'')) } 
            else { return Html.solo(match, rb, rt, POS) } // ルビに｜,ナシ
        }
//        } else { return Html.solo(match, rb, rt) } // 親文字に漢字も｜もない
//        } else { return Html.toShort(match, rb, rt) } // 親文字に漢字も｜もない

        /*
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
        */
    }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}


/*
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
*/
window.RubyParser = RubyParser;
})();
