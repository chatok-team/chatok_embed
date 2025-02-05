const msg_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="#fff" viewBox="0 0 16 16"><path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" /></svg>';
const close_svg = '<svg viewBox="0 0 200 200" width="34" height="34" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M114,100l49-49a9.9,9.9,0,0,0-14-14L100,86,51,37A9.9,9.9,0,0,0,37,51l49,49L37,149a9.9,9.9,0,0,0,14,14l49-49,49,49a9.9,9.9,0,0,0,14-14Z" /></svg>';

//get BOT_NAME and domain param in script
const BOT_NAME = document.currentScript.getAttribute('BOT_NAME');
const ORIGIN_THIS = window.location.origin;
const DOMAIN_NAME = "https://chatok.ir";
const LOCAL_DOMAIN_NAME = "http://localhost:3000";

var check_found;
var open_msg_box = false;


if (BOT_NAME) {

    // add css
    const addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML = css;
    addCSS("#chatok_btn:hover { transform: scale(1.15) !important; background-color: #000000 !important; } #chatok_btn { transition: ease .3s; }");

    //get btn close
    var btn_close_inside;

    // get window width
    const wind_width = window.innerWidth;

    // Make Element
    var chatok_btn = document.createElement("button");
    var chatok_iframe = document.createElement("iframe");

    // Set Content
    chatok_btn.innerHTML = msg_svg;

    // Set ID
    chatok_iframe.id = "chatok_iframe";
    chatok_btn.id = "chatok_btn_toggle";

    //Style List
    chatok_btn.style.backgroundColor = "#353535";
    chatok_btn.style.border = "none";
    chatok_btn.style.cursor = "pointer";
    chatok_btn.style.padding = "14px";
    chatok_btn.style.borderRadius = "50%";
    chatok_btn.style.position = "fixed";
    chatok_btn.style.bottom = "2rem";
    chatok_btn.style.right = "1rem";
    chatok_btn.style.zIndex = "12345678910";

    chatok_iframe.style.position = "fixed";
    chatok_iframe.style.zIndex = "1234567891011";
    chatok_iframe.style.overflow = "hidden";
    chatok_iframe.style.boxShadow = "#0000008d 0px 0px 6px 0px";
    chatok_iframe.style.border = "0";
    chatok_iframe.style.display = "none";

    if (wind_width > 650) {
        chatok_iframe.style.bottom = "8rem";
        chatok_iframe.style.right = "1rem";
        chatok_iframe.style.height = "76vh";
        chatok_iframe.style.width = "448px";
        chatok_iframe.style.borderRadius = "12px";
    } else {

        chatok_iframe.style.bottom = "0";
        chatok_iframe.style.right = "0";
        chatok_iframe.style.height = "100%";
        chatok_iframe.style.width = "100%";
    }

    //set attribute
    chatok_btn.setAttribute("onClick", `${chatok_click_handle.name}()`);
    chatok_btn.setAttribute("open", "N");
    chatok_btn.setAttribute("id", "chatok_btn");
    chatok_iframe.setAttribute("src", `${DOMAIN_NAME}/chat-iframe/${BOT_NAME}`);
    chatok_iframe.setAttribute("referrerpolicy", `strict-origin-when-cross-origin`);

    //add button to body
    document.body.appendChild(chatok_btn);
    document.body.appendChild(chatok_iframe);

    function chatok_click_handle() {

        if (chatok_btn.getAttribute("open") == "N") {

            if (check_found == true) {
                chatok_btn.setAttribute("open", "Y");
                chatok_btn.innerHTML = close_svg;

                open_msg_box = true;

                try {
                    document.getElementById("delay_msg").style.display = "none";
                } catch {

                }

                chatok_iframe.style.display = "flex";
            } else {

                if (check_found == false) {
                    alert("این دامنه برای استفاده این ربات مجاز نمی باشد.");
                } else {
                    alert("لطفا کمی صبر کنید تا اطلاعات ربات خوانده شود.");
                }
            }

        }
        else {
            chatok_btn.setAttribute("open", "N");
            chatok_btn.innerHTML = msg_svg;

            open_msg_box = false;

            chatok_iframe.style.display = "none";
        }
    }

    // Loop Animation

    setTimeout(() => {
        var delay_msg = document.createElement("p");

        delay_msg.setAttribute("id", "delay_msg");

        delay_msg.style.position = "fixed";
        delay_msg.style.backgroundColor = "white";
        delay_msg.style.direction = "rtl";
        delay_msg.style.borderRadius = "32px";
        delay_msg.style.padding = "16px 20px";
        delay_msg.style.fontSize = "18px";
        delay_msg.style.zIndex = "1234567";
        delay_msg.style.boxShadow = "#0000004d 0px 0px 20px 0px";
        delay_msg.style.height = "auto";
        delay_msg.style.width = "auto";

        if (wind_width > 650) {
            delay_msg.style.bottom = "6rem";
            delay_msg.style.right = "1rem";
        } else {
            delay_msg.style.padding = "10px 14px";
            delay_msg.style.fontSize = "16px";
            delay_msg.style.bottom = "6.5rem";
            delay_msg.style.right = "12px";
        }

        delay_msg.innerHTML = "سلام خوبی؟ هر سوالی داری، کمتر از چند ثانیه جوابتو میدم!";

        document.body.appendChild(delay_msg);

        setTimeout(() => {
            delay_msg.style.display = "none";
        }, 7400)

    }, 4000)

    setInterval(() => {

        if (!open_msg_box) {

            chatok_btn.style.transform = "scale(1.35)";

            setTimeout(() => {
                chatok_btn.style.transform = "scale(1)";
            }, 1000);

        }

    }, 7500);
}

// Function to be called from iframe
function closeIframe() {
    chatok_btn.setAttribute("open", "N");
    chatok_btn.innerHTML = msg_svg;
    chatok_iframe.style.display = "none";
}

if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);
}
else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function onMessage(event) {
    // Check sender origin to be trusted
    // if (event.origin !== DOMAIN_NAME) return;

    var data = event.data;

    if (data == "iClose") {
        closeIframe();
    } else {

        if (data.domain_list == "no domain") {

            check_found = true;
        }
        else {
            if (typeof data.domain_list === 'string') {
                const domains_arr = (data.domain_list).split(",");

                domains_arr.map((item) => {
                    if (ORIGIN_THIS.includes(item)) {
                        check_found = true;
                    }
                });

                if (!check_found) {
                    check_found = false;
                }
            }
        }

    }
}