window.addEventListener('load', () => {
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    document.querySelector("#cover").addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    document.querySelector("#cover").className += " cover-hide";
    setTimeout(() => {
        document.querySelector("#banner").className += " banner-bounce";
        document.querySelector("#start").className += " start-after";
        document.querySelector("#intro").className += " intro-after";
        document.querySelector("#redrock").className += " redrock-after";
    }, 1000);
    document.querySelector("#start").addEventListener('touchstart', () => {
        window.location.href = './game.html';
    });
    document.querySelector("#intro").addEventListener('touchstart', () => {
        window.location.href = './intro.html';
    });
    
    if (localStorage.breakOut_isShare) {
        localStorage.breakOut_isShare = '0';
    }
    /*
        判断有无分享参数
        没有的话就是 0
    */
});
/*
(function () {
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    document.querySelector("#cover").addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    // setTimeout(() => {
    //     document.querySelector("#cover").className += " cover-hide";
    //     setTimeout(() => {
    //         document.querySelector("#banner").className += " banner-bounce";
    //         document.querySelector("#start").className += " start-after";
    //         document.querySelector("#intro").className += " intro-after";
    //         document.querySelector("#redrock").className += " redrock-after";
    //     }, 1000);
    // }, 5000);

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

    document.querySelector("#start").addEventListener('touchstart', () => {
        window.location.href = './game.html';
    });
    document.querySelector("#intro").addEventListener('touchstart', () => {
        window.location.href = './intro.html';
    });
})();
*/