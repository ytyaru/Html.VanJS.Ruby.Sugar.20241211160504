;(function(){
//class RubyParser { static parse(src) { return EscapeEm.parse(CommonRubyParser.parse(src)) } }
//class EscapeEm { static parse(src) { return src.replaceAll('«','《《').replaceAll('»','》》') } }
class RubyParser { static parse(src) { return EscapeParser.parse(CommonRubyParser.parse(src)) } }
class EscapeParser { static parse(src) { return src.replaceAll('|','｜').replaceAll('￬','↓').replaceAll('«','《').replaceAll('»','》') } }
//class EscapeParser { static parse(src) { return [['|','｜'],['￬','↓'],['«','《'],['»','》']].reduce((text,esc)=>text.replaceAll(esc[0],esc[1]), src) }
//[['|','｜'],['￬','↓'],['«','《'],['»','》']].reduce((text,esc)=>text.replaceAll(esc[0],esc[1]), src)
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
    static kanjisTwin(match, rbs, rtFs, rtLs, isUnder=false) { // 親文字全漢字でルビに｜と,があり要素数が同一  ｜山田《やま,だ｜YAMA,DA》
        const pos = {first:isUnder ? 'under' : '', last:isUnder ? 'over' : 'under'}
        const loopNum = Math.max(rbs.length, rtFs.length, rtLs.length)
        if (rbs.length!==rtFs.length || rbs.length!==rtLs.length) {console.warn(`親文字が漢字だけでルビ文字に｜があり前者２要素内に,がある場合、親文字数と,要素数はすべて一致していることが期待されます。超過したルビは無視します。不足したルビは親文字をそのまま出力します。 rb:${rbs.length} rtFs:${rtFs.length} rtLs:${rtLs.length} 対象文:${match}`)}

        // 親文字とルビ文字のペアを連続生成する
        const htmls = []
        for (let i=0; i<loopNum; i++) {
            if (i <= rbs.length-1) {
                if (i <= rtFs.length-1 && i <= rtLs.length-1) {htmls.push(Html.nest(rbs[i], rtFs[i], rtLs[i], isUnder))}
                else if (i <= rtFs.length-1) {htmls.push(Html.solo(rbs[i], rtFs[i], pos.first))}
                else if (i <= rtLs.length-1) {htmls.push(Html.solo(rbs[i], rtLs[i], pos.last))}
                else {htmls.push(rbs[i])} // ルビより多い親文字はそのまま出力する
            } // 親文字より多いルビは無視する
        }
        return htmls.join('')
    }
    static seq(match, rbs, rtFs, posF, isNest, rtL, posL, isErr, errMsgBase) { // 複同数の親文字とルビ文字からHTML生成する（任意でネストする）
        // 親文字とルビ文字のペア数を算出する
        const greatBase = rbs.length > rtFs.length
        const loopNum = greatBase ? rtFs.length : rbs.length
        if (isErr) {console.warn(`${errMsgBase} rb:${rbs.length} rt:${rtFs.length} 対象文:${match}\n${rbs.length < rtFs.length ? '超過したルビは無視します。' : '不足したルビは親文字をそのまま出力します。'}`)}
        // 親文字とルビ文字のペアを連続生成する
        const htmls = []
        for (let i=0; i<loopNum; i++) { htmls.push(Html.solo(rbs[i], rtFs[i], posF)) }
        // ルビが不足している残りの親文字をそのまま出力する
        if (greatBase) { for (let i=loopNum; i<rbs.length; i++) { htmls.push(rbs[i]) } }
        // HTML生成
        return isNest ? Html.solo(htmls.join(''), rtL, posL) : htmls.join('')
    }
    static pipes(match, rbs, rtA, isUnder=false) { // 親文字とルビ文字は共に｜で区切られているパターン
        const pos = {
            first: (!isUnder && rtA.pipes.length <= rbs.length) ? '' : (isUnder ? 'under' : 'over'),
            last: isUnder ? 'over' : 'under',
        }
        const diff = rtA.pipes.length - rbs.length
        return Html.seq(match, rbs, rtA.pipes, pos.first,
            rbs.length < rtA.pipes.length, rtA.pipes[rbs.length], pos.last, diff!==0 && diff!==1,
            '親文字が漢字と｜だけの場合、ルビ文字に同数か+1の｜が必要。')
    }
    static kanjis(match, rbA, rtA, posId='') { // ルビ文字は,で区切られているパターン（親文字はすべて漢字）
        const POS = posId.toLowerCase()
        if (!['','under','over'].some(v=>v===POS)){throw new Error(`プログラムエラー`)}
        const pos = {
            first: POS,
            last: POS==='under' ? 'over' : 'under',
        }
        return Html.seq(match, rbA.kanjis.map(k=>k.text), rtA.commas[0], pos.first, 
            1 < rtA.pipes.length, rtA.pipes[1], pos.last, rbA.kanjis.length!==rtA.commas[0].length,
            'ルビにカンマ,がある時はその数が親文字の漢字数-1個であるべきです。')
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
    static kanjiPipeCommas(match, rbA, rtA, isUnder) { // 親＆ルビ文字に｜がありルビ文字に,がある
        console.log(match, rbA, rtA, isUnder)
        //const commas = rtA.commas.map((comma,i)=>comma.slice(0, Math.min(comma.length, rbA.pipes[i].length)))
        const commas = rtA.commas.map((comma,i)=>comma.slice(0, Math.min(comma.length, i < rbA.pipes.length ? rbA.pipes[i].length : 0)))
        const commasLen = commas.reduce((sum,c)=>sum+=c.length, 0)
        if (rbA.kanjis.length!==commasLen){console.warn(`親文字とルビ文字に｜がありルビ文字に,がある場合、親文字はすべて漢字であり、かつ親文字数とカンマ要素数は同数であるべきです。\n親文字の先頭からルビを振ります。数が違うため対応する字と異なる可能性があります。ルビ不足なら親文字をそのまま出力します。ルビ超過なら無視します。\n対象文字:${match} rb:${rbA.kanjis.length} rt:${commasLen}`)}
        const htmls = []
        for (let p=0; p<rbA.pipes.length; p++) {
            const kanjis = Array.from(rbA.pipes[p])
            const L = Math.min(kanjis.length, commas[p].length)
            //for (let i=0; i<L; i++) {htmls.push(Html.solo(kanjis[i], commas[p][i], isUnder ? 'under' : ''))}
            for (let i=0; i<L; i++) {htmls.push(Html.solo(kanjis[i], commas[p][i], isUnder ? 'under' : rbA.pipes.length < rtA.pipes.length ? 'over' : ''))}
            for (let i=L; i<kanjis.length; i++) {htmls.push(kanjis[i])}
        }
//        return htmls.join('')
        // 追加 両面ルビ
        if (rbA.pipes.length < rtA.pipes.length) {
            return Html.solo(htmls.join(''), rtA.pipes[rbA.pipes.length], isUnder ? 'over' : 'under')
        } else {return htmls.join('')}
    }
    static em(text) { return `<em>${text}</em>` }
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
            },
            isAllKanji: kanjis.length===pipes.join('').length,
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
class CommonRubyParser { // Ruby(Short, Long, Escape), Em, 全パターン一括実行
    static #MAX = {RB:50, RT:100}
    static #REGEX = {
        RT: RegExp(`《([^《》\n\r]{1,${this.#MAX.RT}})》`, 'g'),
    }
    static parse(src) {
        const htmls = []
        let match = null
        const idx = {preEnd:0, before:0, after:0} // ルビ要素の前後
        while ((match = this.#REGEX.RT.exec(src)) !== null) {
            let isEm = false
            idx.before = match.index
            idx.after = this.#REGEX.RT.lastIndex
            console.debug(match)
//            console.log(`Found ${match[0]}. Next starts at ${REGEX.RT.lastIndex}.`);
            // rbを探す
            const rbD = RubyBase.analize(src, idx.preEnd, idx.before) // 前回》〜今回《
            console.debug(rbD)
            if (null===rbD){ // 親文字がない（rubyタグと判断できず。emまたはプレーンテキストである）
                isEm = 0 < match.index && this.#REGEX.RT.lastIndex < src.length
                    && '《'===src.slice(match.index-1, match.index)
                    && '》'===src.slice(this.#REGEX.RT.lastIndex, this.#REGEX.RT.lastIndex+1)
                if (idx.preEnd!==idx.before){htmls.push(src.slice(idx.preEnd, idx.before - (isEm ? 1 : 0)))}
                htmls.push(isEm ? Html.em(match[1]) : match[0])
            }
            else {// 親文字がある（rubyタグであると判断した）
                console.debug('rbD:',rbD)
                if (idx.preEnd!==idx.before) {// 親文字より前にあるテキストをそのまま出力する
                    console.debug(`preEnd:${idx.preEnd} start:${rbD.start}`)
                    htmls.push(src.slice(idx.preEnd, rbD.start))
                }
                // <ruby>HTMLかエスケープを出力
//                if (rbD.isEscape) {htmls.push(`${rbD.isShort ? '' : rbD.isUnder ? '↓' : '｜'}${rbD.text}《${match[1]}》`)}
//                else {htmls.push(this.#ruby(src.slice(rbD.start, idx.after+1), rbD, match[1]))}
                htmls.push(this.#ruby(src.slice(rbD.start, idx.after+1), rbD, match[1]))
            }
            idx.preEnd = idx.after + (isEm ? 1 : 0)
        }
        htmls.push(src.slice(idx.after))
        return htmls.join('')
    }
    static #ruby(rubyText, rbD, rt) {
        if (rbD.isShort) { return this.#short(rubyText, rbD, rt) }
        else if (rbD.isLong) { return this.#long(rubyText, rbD, rt) }
        else {throw new Error(`プログラムエラー`)}
    }
    static #short(rubyText, rbD, rt) {
        const rb = rbD.text
        const rtA = Analizer.rt(rt)
        if (1 < rtA.pipes.length && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
            return Html.kanjisTwin(rubyText, Analizer.kanjis(rbD.text).map(k=>k.text), rtA.commas[0], rtA.commas[1])
        }
        else if (rtA.has.commas[0]) { return Html.kanjis(rubyText, Analizer.rb(rb), rtA) }//漢字一字ずつルビ。任意で下にも。
        else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1]) } // 上下に一つずつルビを振る
        else { return Html.solo(rb, rt) } // 上に一つルビを振る
    }
    static #soloPos(pos, isManyRt=false) { return !isManyRt && 'over'===pos ? '' : pos }
    static #long(rubyText, rbD, rt) {
        const rb = rbD.text
        const isUnder = rbD.isUnder
        const pos = {
            first: isUnder ? 'under' : 'over', // 漢字群の読みルビ方向
            last: isUnder ? 'over' : 'under',  // 最後(全体)のルビ方向
        }
        const rtA = Analizer.rt(rt)
        const rbA = Analizer.rb(rb)
        console.debug(`LONG:`, rbA, rtA, pos, this.#soloPos(pos.first, rtA.has.pipe), rtA.has.commas[0])
        if (rbA.has.pipe) { // 親文字に｜がある
            //if (rbA.pipes.length===rtA.pipes.length // ルビ文字に｜があり同数
            if (rbA.pipes.length <= rtA.pipes.length // ルビ文字に｜があり同数以上
             && rtA.has.commas.some(c=>c)           // ルビ文字に,があり
             && rbA.isAllKanji) {                   // 親文字が全部漢字
                return Html.kanjiPipeCommas(rubyText, rbA, rtA, rbD.isUnder)
            } else {return Html.pipes(rubyText, rbD.pipes, rtA, isUnder)}
            /*
            } else if (rbA.pipes.length < rtA.pipes.length // ルビ文字に｜があり親のそれよりルビのほうが一つ多い
             && rtA.has.commas.some(c=>c)           // ルビ文字に,があり
             && rbA.isAllKanji) {                   // 親文字が全部漢字
                // 一字ずつ＋全体
                console.log('*******')
                const rbs = rbA.pipes.map(p=>Array.from(p)).flat()
                const rts = rtA.commas.slice(0, rbA.pipes.length).flat()
                const kanjis = [...Array(rbs.length)].map((_,i)=>[rbs[i],rts[i]])
                console.log(kanjis)
                console.log(kanjis.map(k=>Html.solo(k[0], k[1], this.#soloPos(pos.first, rtA.has.pipe))).join(''))
                return Html.nest(kanjis.map(k=>Html.solo(k[0], k[1], this.#soloPos(pos.first, rtA.has.pipe))).join(''),
                    rtA.pipes[rbA.pipes.length], isUnder)
//                return Html.twin(kanjis.map(k=>Html.solo(k[0], k[1], this.#soloPos(pos.first, rtA.has.pipe))).join(''),
//                    rtA.pipes[rbA.pipes.length], isUnder)
            } else {return Html.pipes(rubyText, rbD.pipes, rtA, isUnder)}
            */
        }
        else if (rbA.has.kanji && !rbA.has.pipe) { // 親文字＝漢字アリ＋｜ナシ
            if (rb===rbA.kanjis.map(k=>k.text).join('')) {// 漢字のみ
                if (rtA.has.pipe && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
                    return Html.kanjisTwin(rubyText, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1], isUnder)
                }
                else if (rtA.has.commas[0]) {return Html.kanjis(rubyText, rbA, rtA, this.#soloPos(pos.first, rtA.has.pipe))}//一字ルビ
                else if (rtA.has.pipe) {return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder)} // 上下ルビ
                else {return Html.solo(rb, rt, this.#soloPos(pos.first, rtA.has.pipe))} // 全体ルビ
            }
            else {// 字種不問
                if (1 < rbA.kanjiGroups.length && rtA.has.pipe) { // 漢字群のみルビ ｜論救の御手《ろんきゅう｜みて｜ロジカル》
                    return Html.kanjiGroups(rubyText, rb, rt, rbA, rtA, isUnder)
                } else if (!rtA.has.pipe && ['↑','↓'].some(s=>rt.includes(s))) { // 上下全体ルビ ｜あ山い《うえ↓した》
                    return Html.twin(rb, rt, isUnder)
                } else { return Html.solo(rb, rt, this.#soloPos(pos.first)) } // 全体単一ルビ  ｜あ山い《うえ》  ↓あ山い《した》
            }
        } 
        else { // 親文字に漢字も｜もない
            const POS = isUnder ? 'under' : ''
            if (['｜',','].every(s=>rt.includes(s))) { return Html.nest(rb, rtA.pipes[0].replaceAll(',',''), rtA.pipes[1].replaceAll(',',''), isUnder) }
            else if (rt.includes(',')) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
            else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder) } 
            else { console.debug(`ルビ文字に漢字も｜もない: rb:${rb} rt:${rt}`); return Html.solo(rb, rt, POS) } // ルビに｜,ナシ
        }
    }
}
class RubyBase {
    static MAX_LEN = 50
    static analize(text, oldRtEnd, newRtStart) { // 前回》〜今回《
        const before50 = text.slice(oldRtEnd, newRtStart).slice(this.MAX_LEN*-1)
        const before = before50.slice(Math.max(0, before50.lastIndexOf('\n'), before50.lastIndexOf('\r')))
        console.debug(`before:${before}`)
        return this.#analize(before, oldRtEnd, newRtStart)
    }
    static #analize(before, oldRtEnd, newRtStart) {
        /*
        const isHalfPipe = before.includes('|')
//        const isHalfPipe2 = before.includes('||')
        const isFullPipe = before.includes('｜')
        const isHalfUnder = before.includes('￬')
//        const isHalfUnder2 = before.includes('￬￬')
        const isFullUnder = before.includes('↓')
        //const isUnder = isHalfUnder2 || isFullUnder
        const isUnder = isHalfUnder || isFullUnder
        //const isLong = isHalfUnder2 || isHalfPipe2 || isFullPipe || isFullUnder
        const isLong = isHalfUnder || isHalfPipe || isFullPipe || isFullUnder
        //const isShort = !isHalfPipe2 && isHalfPipe
//        const isShort = !isHalfPipe && !isFullPipe && 
//        const isEscape = isHalfUnder2 || isHalfPipe2 || isShort 
        const isEscape = isHalfUnder || isHalfPipe
        const isShort = false // 親文字が全部漢字か｜である
        */
        const isFullPipe = before.includes('｜')
        const isFullUnder = before.includes('↓')
        const isUnder = isFullUnder
        // Long親文字パイプ分割系 ｜山田｜太郎《やまだ｜たろう》  ↓山田｜太郎《やまだ｜たろう》
        let pipes = null
        if (isFullPipe || isFullUnder) {
            const pipe = isFullPipe ? '｜' : '↓'
            const matches = [...before.matchAll(RegExp(`[｜↓]`, 'g'))]
            console.debug(matches)
            if (1 < matches.length) {
                pipes = before.slice(matches[0].index + 1).split('｜')
                const rb = before.slice(matches[0].index+1)
                return {
                    //text:before.slice(matches[0].index+1), 
                    text:rb, 
                    start:oldRtEnd + matches[0].index, end:newRtStart,
//                    isLong:isLong, isShort:isShort, isUnder:isUnder, isEscape:isEscape,
                    //isLong:isLong, isShort:/[一-龠々仝〆〇ヶ｜]{1,}/g.test(rb), isUnder:isUnder, isEscape:isEscape,
                    //isLong:true, isShort:false, isUnder:isUnder, isEscape:isEscape,
                    isLong:true, isShort:false, isUnder:isUnder,
                    pipes: pipes,
                }
            }
        }
        // Long系
        //for (let head of ['｜','↓','￬￬','||','|']) {
        for (let head of ['｜','↓']) {
            const li = before.lastIndexOf(head)
            const rb = before.slice(li+head.length, newRtStart)
            if (-1 < li) { return { // Long系
                text:rb, 
                start:oldRtEnd + li, end:newRtStart,
                //isLong:isLong, isShort:isShort, isUnder:isUnder, isEscape:isEscape,
//                isLong:isLong, isShort:false, isUnder:isUnder, isEscape:isEscape,
                isLong:true, isShort:false, isUnder:isUnder,
                pipes:pipes,
            }}
        }
        // Short系（全部漢字）
        const matches = Analizer.kanjis(before, true)
        console.debug(matches)
        if (0 < matches.length) {
            const lastMatch = matches[matches.length-1]
            console.debug(lastMatch)
            if (before.endsWith(lastMatch.text)) {
                //return {text:lastMatch.text, start:newRtStart - lastMatch.text.length, end:newRtStart, isLong:false, isShort:true, isUnder:false, isEscape:false, pipes:pipes}
                return {text:lastMatch.text, start:newRtStart - lastMatch.text.length, end:newRtStart, isLong:false, isShort:true, isUnder:false, pipes:pipes}
            }
        }
        return null
    }
}
window.RubyParser = RubyParser;
})();
