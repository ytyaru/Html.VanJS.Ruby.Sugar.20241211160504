;(function(){
class RubyParser { static parse(src) { return ShortRubyParser.parse(LongRubyParser.parse(src)) } }
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
/*
class EscapeRubyParser { // HTML変換せず、テキスト出力する（先頭|￬だけを削除してそのまま出力する）
    static #PATTERN = /([|￬])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g;
    static #toHtml(match, D, rb, rt) {
        if (rb.startsWith(D)) { return `${'￬'===D ? '↓' : '｜'}${rb.slice(1)}《${rt}》` } // Long系エスケープ
        else { return `${rb}《${rt}》` } // Short系エスケープ
    }
    static parse(src) { return src.replace(this.#PATTERN, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}
class EscapeShortRubyParser { // HTML変換せず、テキスト出力する（先頭|だけを削除してそのまま出力する）
    static #PATTERN = /|([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static parse(src) { return src.replace(this.#PATTERN, (match, rb, rt)=>{ return `${rb}《${rt}》` }) }
}
*/
/*
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    static #toHtml(match, rb, rt) {
        const rtA = Analizer.rt(rt)
        if (1 < rtA.pipes.length && [0,1].every(i=>rtA.has.commas[i])) { // 漢字一字ずつ上下にルビを振る
            const rbA = Analizer.rb(rb)
            return Html.kanjisTwin(match, rbA.kanjis.map(k=>k.text), rtA.commas[0], rtA.commas[1])
        }
        else if (rtA.has.commas[0]) { return Html.kanjis(match, Analizer.rb(rb), rtA) }//漢字一字ずつルビ。任意で下にも。
        else if (rtA.has.pipe) { return Html.nest(rb, rtA.pipes[0], rtA.pipes[1]) } // 上下に一つずつルビを振る
        else { return Html.solo(rb, rt) } // 上に一つルビを振る
    }
    static parse(src) { return src.replace(this.#SHORT, (match, rb, rt)=>{ return this.#toHtml(match, rb, rt) }) }
}
*/
class ShortRubyParser {
    static #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^《》\n\r]{1,20})》/g;
    //static #isShortEscape(offset, P) {return 0 < offset && '|'===P}
//    static #isLongEscape(offset, P) {return 0 < offset && ['｜','↓'].some(s=>s===P)}
    static #isShortEscape(offset, text) {return 0 < offset && '|'===text.slice(offset-1, offset)}
    static #isLongEscape(offset, text) {const P = text.slice(0, offset); return ['｜','↓'].some(s=>P.includes(s))}
//    static #isShortEscape(offset, text) {return 0 < offset && '|'===text.slice(offset-1, offset)}
//    static #isLongEscape(offset, text) {const P=text.slice(offset-1, offset);return 0 < offset && ['｜','↓'].some(s=>s===P)}
    static #toHtml(match, rb, rt, offset, text) {
//        console.log(`SHORT-ESCAPE: ${this.#isEscape(offset, text)} offset:${offset} text:${text}`)
        console.log(`offset:${offset}`, `text:${text}`)
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
    //static #LONG = /([｜↓])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g
    static #LONG = /([｜↓|￬])([^《》\n\r]{1,50})《([^《》\n\r]{1,100})》/g; // |￬はエスケープ用
    static #soloPos(pos, isManyRt=false) { return !isManyRt && 'over'===pos ? '' : pos }
    //static #isEscape(D){return rb.startsWith(D)}
    static #isEscape(D){return ['|','￬'].some(s=>s===D)}
    static #escape(match, D, rb, rt) {
        if (rb.startsWith(D)) { console.log(`ESC-L`,`${'￬'===D ? '↓' : '｜'}${rb.slice(1)}《${rt}》`);return `${'￬'===D ? '↓' : '｜'}${rb.slice(1)}《${rt}》` } // Long系エスケープ
        else { console.log(`ESC-S`); return `|${rb}《${rt}》` } // Short系エスケープ（ShortRubyParser.parse()で|をエスケープする）
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
    //static #toHtml(match, D, rb, rt) { return this[`#${this.#isEscape(D) ? 'escape' : 'convert'}`(match, D, rb, rt)] }
    //static #toHtml(match, D, rb, rt) { console.log(`#${this.#isEscape(D) ? 'escape' : 'convert'}`);return this[`#${this.#isEscape(D) ? 'escape' : 'convert'}`](match, D, rb, rt) }
    static #toHtml(match, D, rb, rt) {return (this.#isEscape(D) ? this.#escape : this.#convert).bind(this)(match, D, rb, rt) }
    static parse(src) { return src.replace(this.#LONG, (match, D, rb, rt)=>{ return this.#toHtml(match, D, rb, rt) }) }
}
window.RubyParser = RubyParser;
})();
