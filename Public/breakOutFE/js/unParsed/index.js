(function () {
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    document.querySelector("#cover").addEventListener('touchmove', (e) => {
        e.preventDefault();
    });

    setTimeout(() => {
        document.querySelector("#cover").className += " cover-hide";
        setTimeout(() => {
            document.querySelector("#banner").className += " banner-bounce";
            document.querySelector("#start").className += " start-after";
            document.querySelector("#intro").className += " intro-after";
            document.querySelector("#redrock").className += " redrock-after";
        }, 1000);
    }, 3000);

    //document.addEventListener('readystatechange', () => {
    //    if (document.readyState === "complete") {
    //        document.querySelector("#cover").className += " cover-hide";
    //        setTimeout(() => {
    //            document.querySelector("#banner").className += " banner-bounce";
    //            document.querySelector("#start").className += " start-after";
    //            document.querySelector("#intro").className += " intro-after";
    //            document.querySelector("#redrock").className += " redrock-after";
    //        }, 1000);
    //    }
    //});
    /* 安卓奇怪的问题, 不能判断加载完成 */


    document.querySelector("#start").addEventListener('touchstart', () => {
        window.location.href = './game.html';
    });
    document.querySelector("#intro").addEventListener('touchstart', () => {
        window.location.href = './intro.html';
    });
})();