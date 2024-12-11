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

    console.log(ShortRubyParser.parse('漢字《かんじ》'))
    console.log(UnderShortRubyParser.parse('↓漢字《かんじ》'))
    console.log(ShortRubyParser.parse('あ漢字《かんじ》い'))
    console.log(UnderShortRubyParser.parse('あ↓漢字《かんじ》い'))
    console.log(ShortRubyParser.parse('漢字《かんじ｜カンジ》'))
    console.log(ShortRubyParser.parse('あ漢字《かんじ｜カンジ》い'))
    console.log(ShortRubyParser.parse('短い漢字《かんじ》が複数《ふくすう》あるよ'))

    console.log(LongRubyParser.parse('連続｜漢字《かんじ》が｜複数《ふくすう》あるよ'))

    console.log(LongRubyParser.parse('｜論救の御手《ろんきゅう｜みて》'))
    console.log(LongRubyParser.parse('｜論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))
    console.log(LongRubyParser.parse('↓論救の御手《ろんきゅう｜みて｜ロジカル・サルベータ》'))

    console.log(LongRubyParser.parse('｜あいうえお《AIUEO》'))
    console.log(LongRubyParser.parse('｜漢字《かんじ》'))
    console.log(LongRubyParser.parse('↓漢字《かんじ》'))
    console.log(LongRubyParser.parse('｜複数の漢字にルビ一つだけ《ふくすう》'))
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

