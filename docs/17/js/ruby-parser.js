;(function(){
//class RubyParser { static parse(src) { return ShortRubyParser.parse(LongRubyParser.parse(src)) } }
class RubyParser { static parse(src) { return CommonRubyParser.parse(src) } }
class Comparer {
    constructor(L,R) {this._L=L;this._R=R;}
    get L() {return this._L} // left
    get R() {return this._R} // right
    get e() {return this._L===this._R} // equal
    get n() {return this._L!==this._R} // not-equal
    get g() {return this._L > this._R} // great
    get l() {return this._L < this._R} // less
    get ge() {return this._L >= this._R} // great
    get le() {return this._L <= this._R} // less
    /*
    lev(v){return this._L===v}
    lnv(v){return this._L!==v}
    lgv(v){return this._L > v}
    llv(v){return this._L < v}
    lgev(v){return this._L >= v}
    llev(v){return this._L <= v}
 
    rev(v){return this._R===v}
    rnv(v){return this._R!==v}
    rgv(v){return this._R > v}
    rlv(v){return this._R < v}
    rgev(v){return this._R >= v}
    rlev(v){return this._R <= v}
    
    and(v){return [this._L,this.R].every(x=>x===v)}
    or(v){return [this._L,this.R].some(x=>x===v)}
    quadMap(c, v, fn1, fn2, fn3, fn4) { // c:e,n,g,l,ge,le, v:Number, p:fn[4]
        const [L,R] = [this[`l${c}v`](v), this[`r${c}v`](v)]
        if (L && R) {return fn1()}
        else if (L) {return fn2()}
        else if (R) {return fn3()}
        else        {return fn4()}
    }
    */
}
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

        /*
        // 親文字とルビ文字のペアを連続生成する
        const flLi = new Comparer(rtFs.length-1, rtLs.length-1)
        const htmls = []
        for (let i=0; i<loopNum; i++) {
            if (i <= rbs.length-1) {
                htmls.push(flLi.quadMap('ge', i, 
                    ()=>Html.nest(rbs[i], rtFs[i], rtLs[i], isUnder), 
                    ()=>Html.solo(rbs[i], rtFs[i], pos.first), 
                    ()=>Html.solo(rbs[i], rtLs[i], pos.last), 
                    ()=>rbs[i])) // ルビより多い親文字はそのまま出力する
            } // 親文字より多いルビは無視する
        }
        return htmls.join('')
        */
    }
    static seq(match, rbs, rtFs, posF, isNest, rtL, posL, isErr, errMsgBase) { // 複同数の親文字とルビ文字からHTML生成する（任意でネストする）
        // 親文字とルビ文字のペア数を算出する
        const btLen = new Comparer(rbs.length, rtFs.length)
        const loopNum = btLen.g ? btLen.R : btLen.L
        if (isErr) {console.warn(`${errMsgBase} rb:${btLen.L} rt:${btLen.R} 対象文:${match}\n${btLen.l ? '超過したルビは無視します。' : '不足したルビは親文字をそのまま出力します。'}`)}
        // 親文字とルビ文字のペアを連続生成する
        const htmls = []
        for (let i=0; i<loopNum; i++) { htmls.push(Html.solo(rbs[i], rtFs[i], posF)) }
        // ルビが不足している残りの親文字をそのまま出力する
        if (btLen.g) { for (let i=loopNum; i<btLen.L; i++) { htmls.push(rbs[i]) } }
        // HTML生成
        return isNest ? Html.solo(htmls.join(''), rtL, posL) : htmls.join('')
    }
    static pipes(match, rbA, rtA, isUnder=false) { // 親文字とルビ文字は共に｜で区切られているパターン
        const pos = {
            first: (!isUnder && rtA.pipes.length <= rbA.pipes.length) ? '' : (isUnder ? 'under' : 'over'),
            last: isUnder ? 'over' : 'under',
        }
        const diff = rtA.pipes.length - rbA.pipes.length
        return Html.seq(match, rbA.pipes, rtA.pipes, pos.first,
            rbA.pipes.length < rtA.pipes.length, rtA.pipes[rbA.pipes.length], pos.last, diff!==0 && diff!==1,
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

class CommonRubyParser { // Short, Long, Escape, 全パターン一括実行
    static #MAX = {RB:50, RT:100}
    static #META = {
//        RB: ['｜','↓','|','￬'],
//        RT: ['《','》','｜','↓','↑',','],
        RB: '｜ ↓ | ￬'.split(' '),
        RT: '《 》 ｜ ↓ ↑ ,'.split(' '),
    }
    static #REGEX = {
        RT: RegExp(`《([^《》\n\r]{1,${this.#MAX.RT}})》`, 'g'),
        RB: {
            KANJI: RegExp(`[一-龠々仝〆〇ヶ]{1,${this.#MAX.RB}}`, 'g'),
            FULL: RegExp(`[^《》\n\r]{1,${this.#MAX.RB}}`, 'g'),
        },
    }
    static parse(src) {
        const htmls = []
        let match = null
        const idx = {preEnd:0, before:0, after:0} // ルビ要素の前後

        // src.slice(idx.preEnd, idx.before)
        // src.slice(idx.after)
//        console.log(`src:${src}`)
        while ((match = this.#REGEX.RT.exec(src)) !== null) {
            idx.before = match.index
            idx.after = this.#REGEX.RT.lastIndex
//            console.log(`Found ${match[0]}. Next starts at ${REGEX.RT.lastIndex}.`);
            // rbを探す
            //const rbD = RubyBase.parse(src, match.index)
            const rbD = RubyBase.analize(src, match.index)
            if (null===rbD){ // 親文字がない（rubyタグと判断できず）
                if (idx.preEnd!==idx.before){htmls.push(src.slice(idx.preEnd, idx.before))}
                htmls.push(match[0])
            }
            else {// 親文字がある（rubyタグであると判断した）
//                console.log('rbD:',rbD)
                if (idx.preEnd!==idx.before) {// 親文字より前にあるテキストをそのまま出力する
                    htmls.push(src.slice(idx.preEnd, rbD.start))
                }
                // <ruby>HTMLかエスケープを出力
                if (rbD.isEscape) {htmls.push(`${rbD.isShort ? '' : rbD.isUnder ? '↓' : '｜'}${rbD.text}《${match[1]}》`)}
                else {htmls.push(this.#ruby(src.slice(rbD.start, idx.after+1), rbD, match[1]))}
                /*
                else if (rbD.isShort) {
                    const rubyText = src.slice(rbD.start, idx.after+1)
                    html.push(this.#short(rbD, match[1]))
                }
                else if (rbD.isLong) {
                    html.push(this.#long(rbD, match[1]))
                }
                else {throw new Error(`プログラムエラー`)}
                */
            }
            idx.preEnd = idx.after
        }
        htmls.push(src.slice(idx.after))
        return htmls.join('')
//        return 0===htmls.length ? src : htmls.join('')
    }
    static #ruby(rubyText, rbD, rt) {
//        console.log(rbD)
        if (rbD.isShort) { return this.#short(rubyText, rbD, rt) }
        else if (rbD.isLong) { return this.#long(rubyText, rbD, rt) }
        else {throw new Error(`プログラムエラー`)}
    }
    static #short(rubyText, rbD, rt) {
        // 漢字《かん,じ｜KAN,JI》
        const rb = rbD.text
//        console.log(rb, rbD)
        const rtA = Analizer.rt(rt)
        if (1 < rtA.pipes.length && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
//            const rbA = Analizer.rb(rb)
//            return Html.kanjisTwin(rubyText, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1])
//            return Html.kanjisTwin(rubyText, rbD.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1])
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
        const rbA = Analizer.rb(rb)
        const rtA = Analizer.rt(rt)
        console.debug(`LONG:`, rbA, rtA, pos, this.#soloPos(pos.first, rtA.has.pipe), rtA.has.commas[0])
        if (rbA.has.kanji && !rbA.has.pipe) { // 親文字＝漢字アリ＋｜ナシ
            if (rb===rbA.kanjis.map(k=>k.text).join('')) {// 漢字のみ
                if (rbA.has.pipe && rtA.has.pipe) { return Html.pipes(rubyText, rbA, rtA, isUnder) }  // 部分ルビ
                else if (rtA.has.pipe && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
                    return Html.kanjisTwin(rubyText, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1], isUnder)
                }
                else if (rtA.has.commas[0]) {return Html.kanjis(rubyText, rbA, rtA, this.#soloPos(pos.first, rtA.has.pipe))}//一次ルビ
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
        } else if (rbA.has.pipe) { return Html.pipes(rubyText, rbA, rtA, isUnder) } // 親文字に漢字がないのに｜はある
        else { // 親文字に漢字も｜もない
            const POS = isUnder ? 'under' : ''
            if (['｜',','].every(s=>rt.includes(s))) { return Html.nest(rb, rtA.pipes[0].replaceAll(',',''), rtA.pipes[1].replaceAll(',',''), isUnder) }
            else if (rt.includes(',')) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
            else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder) } 
            else { console.log(`ルビ文字に漢字も｜もない: rb:${rb} rt:${rt}`); return Html.solo(rb, rt, POS) } // ルビに｜,ナシ
        }
    }
//    static #toHtml(match, D, rb, rt) {return (this.#isEscape(D) ? this.#escape : this.#convert).bind(this)(match, D, rb, rt) }
//    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }

    /*
    static #matches(src) {
        const matches = []
        let match = null
        while ((match = REGEX.RT.exec(src)) !== null) {
            matches.push({text:match[0], parts:match.slice(1), start:match.index, end:REGEX.RT.lastIndex})
        }
        return matches
    }
    //static #LONG = /《([^《》\n\r]{1,100})》/g
    // 《より前にある50文字内に開始文字｜↓|￬がある（Long系 or エスケープ）
    // 《より前にある50文字内に開始文字｜↓|￬がない（Short系の可能性あり）
    static parse(src) { return src.replace(this.#REGEX.RT, (match, rt, offset, text)=>{
        return this.#toHtml(match, rt, offset, text) })
    }
    static #toHtml(match, rt, offset, text) {
        const beforeIdx = Math.max(0,offset-this.MAX.RB)
        //const before = text.slice(beforeIdx , offset) // 《より前にある50文字（rb候補）
        const before50 = text.slice(beforeIdx , offset) // 《より前にある50文字（rb候補）
        const before = before50.slice(0, Math.min(before50.length, before50.lastIndexOf('》'))) // 》があればその直前まで
        const rb = this.#getRb(['￬￬','||','|','｜','↓'], beforeIdx, before, text)
        if (null===rb) {}
        else if ()

        if (before.includes('￬￬')) {rb.text, rb.li}
        //if (before.includes('￬￬')) {}
        else if (before.includes('||')) {}
        else if (before.includes('|')) {}
        else if (['｜','↓'].some(s=>before.lastIndexOf(s))) {}
        else {return match}
    }
    static #getRb(heads, beforeIdx, before, text) {
        const isUnder = before.includes('￬￬') || before.includes('↓')
        const isLong = before.includes('￬￬') || before.includes('||') || before.includes('｜') 
        const isShort = !before.includes('||') && before.includes('|')
        const isEscape = before.includes('￬￬') || before.includes('||') || isShort 
        // beforeの末尾から漢字が連続するインデックスを前方向に辿る（beofore末尾が漢字＆）
        const isKanjis = matchAll(REGEX.RB.KANJI)
        for (let head of heads) {
            const li = before.lastIndexOf(head)
            //if (-1 < li) {return [before.slice(li, offset), li]}
            if (-1 < li) {return {text:before.slice(li, offset), li:li, isLong:isLong, isShort:isShort, isUnder:isUnder}}
               
               
                
        }
        return null
    }
    static #LongUnderEscape(beforeIdx, before) {
        const li = before.lastIndexOf('￬￬')
        before.slice(before.lastIndexOf('￬￬'), offset)
        if (0 < beforeIdx && '￬'===text.slice(li-1, li)) {

        }
        li
        before.lastIndexOf('￬') && 0 < beforeIdx && text.slice(before.lastIndexOf('￬')-1, before.lastIndexOf('￬'))
    }
    */
}
class RubyBase {
    static MAX_LEN = 50
    static analize(text, rtIdx) { // rtIdx:《のindex
//        console.log(`RubyBase: text:${text} rtIdx:${rtIdx}`)
        const before = this.#before(text, rtIdx)
        return this.#analize(before, rtIdx)
    }
    static #before(text, rtIdx) { // rtIdx:《のindex
//        console.log(`text:${text} rtIdx:${rtIdx}`)
        const beforeIdx = Math.max(0,rtIdx-this.MAX_LEN)
        const before50 = text.slice(beforeIdx , rtIdx) // 《より前にある50文字（rb候補）
//        console.log(`before50:${before50}`)
        //console.log(`before50:${before50}`)
        //before50.matchAll(/[｜↓|￬《》\n\r]/g)
        const ends = [...before50.matchAll(/[》\n\r]/g)]
        const end = 0===ends.length ? before50.length : ends.map(s=>{const i=before50.lastIndexOf(s); return i<0 ? before50.length : i})
//        console.log(`end:${end}`)
        //const end = Math.max(...[...before50.matchAll(/[》\n\r]/g)].map(s=>{const i=before50.lastIndexOf(s); return i<0 ? before50.length : i}))
        //const before = before50.slice(0, Math.min(before50.length, before50.lastIndexOf('》'))) // 》があればその直前まで
        //const before = before50.slice(0, end) // 》\n\rがあればその直前まで
//        const rb = this.#getRb(['￬￬','||','|','｜','↓'], beforeIdx, before, text)
        return before50.slice(0, end) // 》\n\rがあればその直前まで
    }
    static #analize(before, rtIdx) {
        const isHalfPipe = before.includes('|')
        const isHalfPipe2 = before.includes('||')
        const isFullPipe = before.includes('｜')
        const isHalfUnder2 = before.includes('￬￬')
        const isFullUnder = before.includes('↓')
//        console.log(`before:${before} isHalfUnder2:${isHalfUnder2}`)
        /*
        const isUnder = before.includes('￬￬') || before.includes('↓')
        const isLong = before.includes('￬￬') || before.includes('||') || before.includes('｜') 
        const isShort = !before.includes('||') && before.includes('|')
        const isEscape = before.includes('￬￬') || before.includes('||') || isShort 
        */
        const isUnder = isHalfUnder2 || isFullUnder
        const isLong = isHalfUnder2 || isHalfPipe2 || isFullPipe || isFullUnder
        const isShort = !isHalfPipe2 && isHalfPipe
        const isEscape = isHalfUnder2 || isHalfPipe2 || isShort 
        for (let head of ['｜','↓','￬￬','||','|']) {
            const li = before.lastIndexOf(head)
            //if (-1 < li) {return [before.slice(li, offset), li]}
            //const start = li+head.length-1
            //const rb = before.slice(start, rtIdx)
            const rb = before.slice(li+head.length-1, rtIdx)
//            const kanjis = Analizer.kanjis(rb, true)
//            const kanjiGroups = Analizer.kanjis(rb, true)
            if (-1 < li) { return { // Long系
                text:rb, 
                //start:start, end:rtIdx,
                start:li, end:rtIdx,
                isLong:isLong, isShort:isShort, isUnder:isUnder, isEscape:isEscape,
                //kanjis:kanjis, kanjiGroups:kanjiGroups,
                kanjis:Analizer.kanjis(rb), kanjiGroups:Analizer.kanjis(rb, true),
            }}
        }
        // Short系（全部漢字）
//        console.log(`SHORT before:${before}`)
        if (/^[一-龠々仝〆〇ヶ]{1,}$/.test(before)) {
            return {text:before, start:rtIdx-before.length, end:rtIdx, isLong:false, isShort:true, isUnder:false, isEscape:false}
        }
        return null
    }
    static kanjis(before) {
        // beforeの末尾から漢字が連続するインデックスを前方向に辿る（beofore末尾が漢字＆）
        const isKanjis = before.matchAll(REGEX.RB.KANJI)

    }
    static kanjis(before, isGroup=false) {
        const kanjis = []
        const KANJI = RegExp(`[一-龠々仝〆〇ヶ]${isGroup ? '{1,}' : ''}`, 'g')
        let match = null
        while ((match = KANJI.exec(before)) !== null) {
            kanjis.push({text:match[0], start:match.index, end:KANJI.lastIndex})
        }
        return kanjis
    }

}
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #isShortEscape(offset, text) {return 0 < offset && '|'===text.slice(offset-1, offset)}
    static #isLongEscape(offset, text) {const P = text.slice(0, offset); return ['｜','↓'].some(s=>P.includes(s))}
    static #toHtml(match, rb, rt, offset, text) {
        if (this.#isShortEscape(offset, text)) { return `${rb}《${rt}》` } // Shortエスケープ
        else if (this.#isLongEscape(offset, text)) { return `${rb}《${rt}》` } // Longエスケープ
        const rtA = Analizer.rt(rt)
        if (1 < rtA.pipes.length && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
            const rbA = Analizer.rb(rb)
            return Html.kanjisTwin(match, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1])
        }
        else if (rtA.has.commas[0]) { return Html.kanjis(match, Analizer.rb(rb), rtA) }//漢字一字ずつルビ。任意で下にも。
        else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1]) } // 上下に一つずつルビを振る
        else { return Html.solo(rb, rt) } // 上に一つルビを振る
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt, offset, text)=>{ return this.#toHtml(match, rb, rt, offset, text) }) }
}
class LongRubyParser {
    static #LONG = /([｜↓|￬])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g; // |￬はエスケープ用
    static #soloPos(pos, isManyRt=false) { return !isManyRt && 'over'===pos ? '' : pos }
    static #isEscape(D){return ['|','￬'].some(s=>s===D)}
    static #escape(match, D, rb, rt) {
        if (rb.startsWith(D)) {return `${'￬'===D ? '↓' : '｜'}${rb.slice(1)}《${rt}》` } // Long系エスケープ
        else {return `|${rb}《${rt}》` } // Short系エスケープ（ShortRubyParser.parse()で|をエスケープする）
    }
    static #convert(match, D, rb, rt) {
        const isUnder = '↓'===D
        const pos = {
            first: '↓'===D ? 'under' : 'over', // 漢字群の読みルビ方向
            last: '↓'===D ? 'over' : 'under',  // 最後(全体)のルビ方向
        }
        const rbA = Analizer.rb(rb)
        const rtA = Analizer.rt(rt)
        console.log(`LONG:`, rbA, rtA, pos, this.#soloPos(pos.first, rtA.has.pipe), rtA.has.commas[0])
        if (rbA.has.kanji && !rbA.has.pipe) { // 親文字＝漢字アリ＋｜ナシ
            if (rb===rbA.kanjis.map(k=>k.text).join('')) {// 漢字のみ
                if (rbA.has.pipe && rtA.has.pipe) { return Html.pipes(match, rbA, rtA, isUnder) }  // 部分ルビ
                else if (rtA.has.pipe && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
                    return Html.kanjisTwin(match, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1], isUnder)
                }
                else if (rtA.has.commas[0]) {return Html.kanjis(match, rbA, rtA, this.#soloPos(pos.first, rtA.has.pipe))}//一次ルビ
                else if (rtA.has.pipe) {return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder)} // 上下ルビ
                else {return Html.solo(rb, rt, this.#soloPos(pos.first, rtA.has.pipe))} // 全体ルビ
            }
            else {// 字種不問
                if (1 < rbA.kanjiGroups.length && rtA.has.pipe) { // 漢字群のみルビ ｜論救の御手《ろんきゅう｜みて｜ロジカル》
                    return Html.kanjiGroups(match, rb, rt, rbA, rtA, isUnder)
                } else if (!rtA.has.pipe && ['↑','↓'].some(s=>rt.includes(s))) { // 上下全体ルビ ｜あ山い《うえ↓した》
                    return Html.twin(rb, rt, isUnder)
                } else { return Html.solo(rb, rt, this.#soloPos(pos.first)) } // 全体単一ルビ  ｜あ山い《うえ》  ↓あ山い《した》
            }
        } else if (rbA.has.pipe) { return Html.pipes(match, rbA, rtA, isUnder) } // 親文字に漢字がないのに｜はある
        else { // 親文字に漢字も｜もない
            const POS = isUnder ? 'under' : ''
            if (['｜',','].every(s=>rt.includes(s))) { return Html.nest(rb, rtA.pipes[0].replaceAll(',',''), rtA.pipes[1].replaceAll(',',''), isUnder) }
            else if (rt.includes(',')) { return Html.solo(rb, rtA.pipes[0].replaceAll(',',''), POS) }
            else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1], isUnder) } 
            else { console.log(`ルビ文字に漢字も｜もない: rb:${rb} rt:${rt}`); return Html.solo(rb, rt, POS) } // ルビに｜,ナシ
        }
    }
    static #toHtml(match, D, rb, rt) {return (this.#isEscape(D) ? this.#escape : this.#convert).bind(this)(match, D, rb, rt) }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}
window.RubyParser = RubyParser;
})();
