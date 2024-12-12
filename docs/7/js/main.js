window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.Ruby.Sugar.20241211160504/`}, 'Ruby.Sugar')),
        p('HTMLのRubyを簡易生成する。'),
//        p('Easily generate HTML Ruby.'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())

    console.log(RubyParser.parse('漢字《かんじ》'))
    console.log(RubyParser.parse('漢字《かん,じ》'))
    console.log(RubyParser.parse('漢字《かんじ｜カンジ》'))
    console.log(RubyParser.parse('漢字《かん,じ,不正》'))
//    console.log(UnderRubyParser.parse('↓漢字《かんじ》'))
    console.log(RubyParser.parse('↓漢字《かんじ》'))
    console.log(RubyParser.parse('あ漢字《かんじ》い'))
//    console.log(UnderRubyParser.parse('あ↓漢字《かんじ》い'))
    console.log(RubyParser.parse('あ↓漢字《かんじ》い'))
    console.log(RubyParser.parse('あ漢字《かんじ｜カンジ》い'))
    console.log(RubyParser.parse('短い漢字《かんじ》が複数《ふくすう》あるよ'))

    console.log(RubyParser.parse('連続｜漢字《かんじ》が｜複数《ふくすう》あるよ'))

    console.log(RubyParser.parse('｜論救の御手《ろんきゅう｜みて》'))
    console.log(RubyParser.parse('｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))
    console.log(RubyParser.parse('↓論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))
    //console.log(RubyParser.parse('↓論救の御手《ろん,きゅう｜み,て｜ロジカル・サルベータ》'))

    console.log(RubyParser.parse('｜あいうえお《AIUEO》'))
    console.log(RubyParser.parse('｜漢字《かんじ》'))
    console.log(RubyParser.parse('↓漢字《かんじ》'))
    console.log(RubyParser.parse('｜ああ複数の漢字にルビ一つだけ《ふくすう》'))
    // 想定外↓↓↓↓↓
    console.log(RubyParser.parse('｜漢字《》'))
    console.log(RubyParser.parse('｜漢字《》'))
    console.log(RubyParser.parse('｜漢字《｜》'))
    console.log(RubyParser.parse('｜漢字《か｜カ》'))
    console.log(RubyParser.parse('｜漢字《か｜》'))
    console.log(RubyParser.parse('｜漢字《｜カ》'))
    console.log(RubyParser.parse('｜漢字《か｜カ｜キ》'))
    // 想定外↑↑↑↑↑
    console.log(RubyParser.parse('山《やま》田《だ》'))
    console.log(RubyParser.parse('太《た》郎《ろう》'))
    console.log(RubyParser.parse('山田《やまだ》太郎《たろう》'))
    console.log(RubyParser.parse('山田太郎《やまだたろう》'))
    console.log(RubyParser.parse('山田太郎《やまだたろう｜Yamada Tarou》'))
    console.log(RubyParser.parse('山田太郎《やまだたろう》'))

    // KanjiGroupRubyParser
    console.log(RubyParser.parse('｜山田｜太郎《やまだ｜たろう》'))
    console.log(RubyParser.parse('｜山田｜太郎《やまだ｜たろう｜ヤマさん》'))
    console.log(RubyParser.parse('｜山田｜太郎《やまだたろう》'))
//    console.log(RubyParser.parse('山田太郎《やま｜だ｜た｜ろう｜やまだたろう》')) // 不可能！！！
//    console.log(RubyParser.parse('山田太郎《やま,だ,た,ろう》'))
//    console.log(RubyParser.parse('山田太郎《やま,だ,た,ろう｜やまだたろう》'))
//    console.log(RubyParser.parse('HTML《Hyper,Text,Markup,Language｜エイチティーエムエル》'))
//    console.log(RubyParser.parse('一二〇〇《ひと,ふた,まる,まる｜じゅうにじ》'))

    // KanjiRubyParser
    console.log(RubyParser.parse('｜山田太郎《やま,だ,た,ろう》'))
    console.log(RubyParser.parse('↓山田太郎《やま,だ,た,ろう》'))
    console.log(RubyParser.parse('｜山田太郎《やま,だ》')) // エラー 要素数が非同数。
    console.log(RubyParser.parse('｜山田太郎《やま,だ,た,ろう｜ヤマさん》'))
    console.log(RubyParser.parse('↓山田太郎《やま,だ,た,ろう｜ヤマさん》'))
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

