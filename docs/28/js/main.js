window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
//    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/Html.VanJS.Ruby.Sugar.20241211160504/`}, 'Ruby.Sugar')),
        van.tags.p('HTMLのRubyを簡易生成する。'),
//        p('Easily generate HTML Ruby.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())

    // Ruby(Short, Long, Escape), Em(Escape)
    const a = new Assertion()
    const bb = new BlackBox(a)
    a.t(()=>RubyParser.parse('漢字《かんじ》')==='<ruby>漢字<rp>（</rp><rt>かんじ</rt><rp>）</rp></ruby>')
    const table = UnitTest.test(a, 'RubyShort')
    a.fin()
    document.querySelector(`main`).append(table)
    document.querySelector(`textarea`).focus()

    console.log(RubyParser.parse('漢字《かんじ》'))
    console.log(RubyParser.parse('漢字《かん,じ》'))
    console.log(RubyParser.parse('漢字《かんじ｜カンジ》'))
    console.log(RubyParser.parse('漢字《かん,じ,超過》')) // 超過分ルビは無視してHTML化する
    console.log(RubyParser.parse('漢字《かん,じ｜KAN,JI》'))
    console.log(RubyParser.parse('↓漢字《かんじ》'))
    console.log(RubyParser.parse('あ漢字《かんじ》い'))
    console.log(RubyParser.parse('あ↓漢字《かんじ》い'))
    console.log(RubyParser.parse('あ漢字《かんじ｜カンジ》い'))
    console.log(RubyParser.parse('短い漢字《かんじ》が複数《ふくすう》あるよ'))
    console.log(RubyParser.parse('連続｜漢字《かんじ》が｜複数《ふくすう》あるよ'))

    console.log(RubyParser.parse('｜論救の御手《ろんきゅう｜みて》'))
    console.log(RubyParser.parse('｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))
    console.log(RubyParser.parse('↓論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))
    console.log(RubyParser.parse('｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ｜無視される》'))
    console.log(RubyParser.parse('｜論救の御手《ろん,きゅう｜み,て｜ロジカル・サルベータ》'))
    console.log(RubyParser.parse('↓論救の御手《ろん,きゅう｜み,て｜ロジカル・サルベータ》'))
    console.log(RubyParser.parse('｜論救の御手《ろん,きゅう｜みて｜ロジカル・サルベータ》'))

    console.log(RubyParser.parse('｜あいうえお《AIUEO》'))
    console.log(RubyParser.parse('｜漢字《かんじ》'))
    console.log(RubyParser.parse('↓漢字《かんじ》'))
    console.log(RubyParser.parse('｜ああ複数の漢字群にルビ一つだけ《ふくすう》'))
    console.log(RubyParser.parse('↓ああ複数の漢字群にルビ一つだけ《ふくすう》'))
    console.log(RubyParser.parse('｜ああ複数の漢字群にルビ二つだけ《ふくすう｜かんじぐん》'))
    console.log(RubyParser.parse('｜ああ複数の漢字群にルビ三つだけ《ふくすう｜かんじぐん｜みっ》'))
    console.log(RubyParser.parse('｜ああ複数の漢字群にルビ四つだけ《ふくすう｜かんじぐん｜よっ｜全体ルビ》'))
    console.log(RubyParser.parse('｜ああ複数の漢字群にルビ五つだけ《ふくすう｜かんじぐん｜いつ｜全体ルビ｜無視される》'))

    // 漢字群を無視して強制的に上下単一全体ルビ
    console.log(RubyParser.parse('｜あ複数い漢字群う《うえ↓した》'))
    console.log(RubyParser.parse('↓あ複数い漢字群う《した↑うえ》'))
    console.log(RubyParser.parse('｜あ複数い漢字群う《うえ↑した》'))
    console.log(RubyParser.parse('↓あ複数い漢字群う《した↓うえ》'))

    // 想定外↓↓↓↓↓
    console.log(RubyParser.parse('｜《》'))
    console.log(RubyParser.parse('｜｜《》'))
    console.log(RubyParser.parse('｜漢字《》'))
    console.log(RubyParser.parse('｜漢字《,》'))
    console.log(RubyParser.parse('｜漢字《,じ》'))
    console.log(RubyParser.parse('｜漢字《かん,》'))
    console.log(RubyParser.parse('｜漢字《,,》'))
    console.log(RubyParser.parse('｜漢字《｜》'))
    console.log(RubyParser.parse('｜漢字《か｜》'))
    console.log(RubyParser.parse('｜漢字《｜カ》'))
    console.log(RubyParser.parse('｜漢字《｜｜》'))
    console.log(RubyParser.parse('｜漢字《｜｜KA》'))
    console.log(RubyParser.parse('｜漢字《かんじ｜カンジ｜KANJI》')) // 二つ目以降の｜要素は無視される
    console.log(RubyParser.parse('｜漢字《かん,じ｜カン,ジ｜KAN,JI》')) // 二つ目以降の｜要素は無視される。一字ルビは最初だけ。
    // 想定外↑↑↑↑↑

    console.log(RubyParser.parse('｜漢字《かんじ｜カンジ》')) // 上下ルビ
    console.log(RubyParser.parse('↓漢字《かんじ｜カンジ》')) // 上下ルビ
    console.log(RubyParser.parse('｜漢字《かん,じ｜カンジ》')) // 上下ルビ（一字ルビ＋全体）
    console.log(RubyParser.parse('↓漢字《かん,じ｜カンジ》')) // 上下ルビ（一字ルビ＋全体）
    console.log(RubyParser.parse('｜漢字《かん,じ｜カン,ジ》')) // 一字ルビは最初だけ。最後は,が含まれてしまう
    console.log(RubyParser.parse('｜漢字《かん,じ｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('↓漢字《かん,じ｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))

    // kanjisTwin 上下少なくとも一方のルビが少ない
    console.log(RubyParser.parse('｜漢字少《かん,じ,しょう｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('｜漢字少《かん,じ｜KAN,JI,SHOU》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('｜漢字少《かん,じ｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('↓漢字少《かん,じ,しょう｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('↓漢字少《かん,じ｜KAN,JI,SHOU》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))
    console.log(RubyParser.parse('↓漢字少《かん,じ｜KAN,JI》')) // 一字ルビを上下共に必要とする場合もありうる？(ローマ字(発音記号))


    console.log(RubyParser.parse('山《やま》田《だ》'))
    console.log(RubyParser.parse('太《た》郎《ろう》'))
    console.log(RubyParser.parse('山田《やまだ》太郎《たろう》'))
    console.log(RubyParser.parse('山田太郎《やまだたろう》'))
    console.log(RubyParser.parse('山田太郎《やまだたろう｜Yamada Tarou》'))

    // KanjiGroupRubyParser
    console.log(RubyParser.parse('山田｜太郎《やまだ｜たろう》')) // 太郎に両ルビが振られ、山田はそのまま出力される
    console.log(RubyParser.parse('あ山田｜太郎《やまだ｜たろう》')) // 太郎に両ルビが振られ、山田はそのまま出力される
    console.log(RubyParser.parse('｜山田｜太郎《やまだ｜たろう》'))
    console.log(RubyParser.parse('↓山田｜太郎《やまだ｜たろう》'))
    console.log(RubyParser.parse('｜山田｜太郎《やまだ｜たろう｜ヤマさん》'))
    console.log(RubyParser.parse('↓山田｜太郎《やまだ｜たろう｜ヤマさん》'))
    console.log(RubyParser.parse('｜山田｜太郎《やま,だ｜た,ろう》'))
    console.log(RubyParser.parse('↓山田｜太郎《やま,だ｜た,ろう》'))
    console.log(RubyParser.parse('｜山田｜太郎《やまだたろう》')) // ルビ文字の｜が足りない！
    console.log(RubyParser.parse('｜山田｜太郎《やま,｜,ろう》'))
    console.log(RubyParser.parse('｜山田｜太郎《やま｜ろう》'))
    //console.log(RubyParser.parse('｜山田下｜太郎助《やま,した｜ろう,すけ》')) // ルビ,不足
    console.log(RubyParser.parse('｜山田下｜太郎助《やま,だ｜た,ろう》')) // ルビ,不足
    console.log(RubyParser.parse('｜山田下｜太郎助《やま,だ｜た》')) // ルビ,不足
    console.log(RubyParser.parse('｜山田｜太郎《やま,だ,した｜た,ろう,すけ》')) // ルビ,超過
    console.log(RubyParser.parse('｜山田下｜太郎助《やま,だ,した｜た,ろう,すけ》'))
    console.log(RubyParser.parse('｜おや｜もじ《OYA｜MOJI》')) // 親文字が漢字じゃない！
    console.log(RubyParser.parse('｜おや｜文字《OYA｜MOJI》')) // 親文字が漢字じゃない！
    console.log(RubyParser.parse('｜親｜もじ《OYA｜MOJI》')) // 親文字が漢字じゃない！
    console.log(RubyParser.parse('｜改行《かいぎょう》\nが｜有《あ》る｜親｜もじ《OYA｜MOJI》')) // 親文字が漢字じゃない！
//    console.log(RubyParser.parse('山田太郎《やま｜だ｜た｜ろう｜やまだたろう》')) // 不可能！！！
//    console.log(RubyParser.parse('山田太郎《やま,だ,た,ろう》'))
//    console.log(RubyParser.parse('山田太郎《やま,だ,た,ろう｜やまだたろう》'))
//    console.log(RubyParser.parse('HTML《Hyper,Text,Markup,Language｜エイチティーエムエル》'))
//    console.log(RubyParser.parse('一二〇〇《ひと,ふた,まる,まる｜じゅうにじ》'))

    // KanjiRubyParser
    console.log(RubyParser.parse('｜山田太郎《やま,だ,た,ろう》'))
    console.log(RubyParser.parse('↓山田太郎《やま,だ,た,ろう》'))
    console.log(RubyParser.parse('｜山田太郎《やま,だ》')) // 不足分ルビはそのまま親文字だけを出力してHTML化する
    console.log(RubyParser.parse('｜山田太郎《やま,だ,た,ろう｜ヤマさん》'))
    console.log(RubyParser.parse('↓山田太郎《やま,だ,た,ろう｜ヤマさん》'))
    console.log(RubyParser.parse('↓山田太郎《やま,だ,た,ろう｜ヤマさん｜無視される》')) // 超過分ルビは無視される

    // 旧エスケープ
//    console.log(RubyParser.parse('|山田太郎《やま,だ,た,ろう》')) // Short
//    console.log(RubyParser.parse('||あ山田太郎《やま,だ,た,ろう》')) // Long
//    console.log(RubyParser.parse('￬￬あ山田太郎《やま,だ,た,ろう》'))
    // 新エスケープ
    console.log(RubyParser.parse('山田太郎«やま,だ,た,ろう»')) // 山田太郎《やま,だ,た,ろう》
    console.log(RubyParser.parse('|山田太郎«やま,だ,た,ろう»')) // ｜山田太郎《やま,だ,た,ろう》
    console.log(RubyParser.parse('￬山田太郎«やま,だ,た,ろう»')) // ↓山田太郎《やま,だ,た,ろう》

    // wbr
    console.log(RubyParser.parse(`我《わ》が深淵《しんえん》なる碧《あお》き理《ことわり》よ\\
その確《かく》たる論拠《ろんきょ》を信《しん》ずる神《かみ》とし\\
生呪《せいじゅ》の罪禍《ざいか》に喘《あえ》ぐ我《われ》らを救《すく》い給《たま》え\\
｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》`))



    // em
    console.log(RubyParser.parse('ここを《《強調》》する。当然《とうぜん》｜漢字《かんじ》と併用も可能。'))
    console.log(RubyParser.parse('ここを《《強調》》する。«強調»のエスケープも可能。当然《とうぜん》｜漢字《かんじ》と併用も可能。'))

    let text = `　よくある一般的《いっぱんてき》なルビ振《ふ》りについて。

　圏点《けんてん》（傍点《ぼうてん》）を振ることもできます。

「俺の言うことを聞かなければどうなるか、《《わかってるよな？》》」

　漢字が連続しているが、ルビ開始位置は途中からにしたい場合、パイプ|を使います。

対象外｜対象《たいしょう》

　漢字以外にもルビを振れます。ルビを振りたい親文字の開始位置にパイプ|を使います。

｜ひらがな《ヒラガナ》｜HTML《HyperTextMarkupLanguage》

　漢字一字ずつにルビを振ることもできます。

山田《やま,だ》
｜山田《やま,だ》

　連続したルビ要素をまとめて作れます。

｜山田｜太郎《やまだ｜たろう》
｜ひら｜がな《ヒラ｜ガナ》
｜H｜T｜M｜L《Hyper｜Text｜Markup｜Language》

　両面ルビを作れます。ルビ要素をネストしています。

山田《やまだ｜ヤマさん》
｜山田《やまだ｜ヤマさん》
`

    console.log(RubyParser.parse(text))

});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

