(function () {
    document.addEventListener('readystatechange', () => {
        if (document.readyState === "complete") {
            document.querySelector("#cover").className += " cover-hide";
            setTimeout(() => {
                document.querySelector("#banner").className += " banner-bounce";
                document.querySelector("#start").className += " start-after";
                document.querySelector("#intro").className += " intro-after";
                document.querySelector("#redrock").className += " redrock-after";
                //alert(document.height);
                //alert(window.innerHeight);
                //alert(window.screen.availHeight);
                //document.height = window.innerHeight;
            }, 1000);
        }
    });
    document.querySelector("#start").addEventListener('touchstart', () => {
        window.location.href = './game.html';
    });
    document.querySelector("#intro").addEventListener('touchstart', () => {
        window.location.href = './intro.html';
    });
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
})();