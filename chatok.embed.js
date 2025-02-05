const scriptTag = document.currentScript;

// ایجاد المان اسکریپت برای اضافه کردن جی‌کوئری
const jqueryScript = document.createElement('script');
jqueryScript.src = "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js";
document.head.appendChild(jqueryScript);

// اطمینان از اجرا بعد از بارگذاری کامل
jqueryScript.onload = function () {

	$(document).ready(async function () {

		function isMobileDevice() {
			return /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
		}

		var ipInfo = {};

		try {
			await fetchWithCache('https://api4.my-ip.io/v2/ip.json', 300_000)
				.then(response => response)
				.then(data => {

					if (data.success) {
						ipInfo = {
							ip: data.ip,
							country: data.country.name || null,
							region: data.region || null,
							city: data.city || null,
							mobile: Number(isMobileDevice()),
							isp: data.asn.name || null,
							locationDetails: `${data.location.lat || null}, ${data.location.lon || null}`
						};

					}

				})


		} catch { }

		const markedownScript = document.createElement('script');
		markedownScript.src = "https://cdn.jsdelivr.net/npm/marked@15.0.6/marked.min.js";
		document.head.appendChild(markedownScript);

		async function fetchWithCache(url, cacheTimeInMs) {

			const cacheName = 'my-app-cache';
			const cache = await caches.open(cacheName);

			// بررسی کش
			const cachedResponse = await cache.match(url);

			// اگر داده‌ها در کش بودند
			if (cachedResponse) {
				const dateHeader = cachedResponse.headers.get('sw-cached-timestamp');
				const now = Date.now();

				// اگر کش منقضی نشده باشد، از کش استفاده می‌کنیم
				if (dateHeader && now - Number(dateHeader) < cacheTimeInMs) {
					return cachedResponse.json();
				}
			}

			// در صورتی که داده‌ها در کش نبودند یا منقضی شده‌اند، درخواست به سرور
			const response = await fetch(url, { method: "GET" });
			if (response.ok) {
				const responseClone = response.clone();

				// اضافه‌کردن timestamp به هدر پاسخ
				const headers = new Headers(responseClone.headers);
				headers.append('sw-cached-timestamp', Date.now().toString());

				const customResponse = new Response(responseClone.body, { headers });

				// ذخیره‌سازی داده در کش
				cache.put(url, customResponse);
			}

			return response.json();
		}

		function setCacheItem(key, value, expirationMinutes) {
			const now = new Date().getTime();
			const expirationTime = now + expirationMinutes * 60 * 1000;

			const data = {
				value: value,
				expiration: expirationTime,
			};

			localStorage.setItem(key, JSON.stringify(data));
			return true;
		}

		function getCacheItem(key) {
			const itemStr = localStorage.getItem(key);

			if (!itemStr) {
				return null;
			}

			const item = JSON.parse(itemStr);
			const now = new Date().getTime();

			if (now > item.expiration) {
				localStorage.removeItem(key);
				return null;
			}

			return item.value;
		}

		// ****************************************
		var lang = "";
		// const browserLang = navigator.language || navigator.userLanguage;
		const websiteLang = document.documentElement.lang;

		const languages = {
			"fa": {
				"welcome": "سلام به وبسایت ما خوش آمدید، چطور می‌توانم به شما کمک کنم؟",
				"inputPlaceholder": "پیام خود را وارد نمایید...",
				"powerBy": "قدرت گرفته توسط",
				"chatok": "چت اوکی",
				"goToChatBtn": "شروع چت با پشتیبان",
				"inProgress": "در حال پردازش...",
				"reqError": "خطا در ارتباط با سرور.",
				"limitReqErorr": "تعداد پیام های ارسال شده بیش از حد مجاز لطفا بعدا امتحان کنید!",
				"beta": "(آزمایشی)"
			},
			"en": {
				"welcome": "Welcome to our website, how can I help you?",
				"inputPlaceholder": "Enter your message...",
				"powerBy": "Powered by",
				"chatok": "ChatOK",
				"goToChatBtn": "Start chat with support",
				"inProgress": "Processing...",
				"reqError": "Error connecting to the server.",
				"limitReqErorr": "The number of messages sent exceeds the allowed limit. Please try again later!",
				"beta": "(Beta)"
			},
			"ar": {
				"welcome": "مرحبًا بكم في موقعنا، كيف يمكنني مساعدتك؟",
				"inputPlaceholder": "أدخل رسالتك...",
				"powerBy": "مشغل بواسطة",
				"chatok": "چت اوکی",
				"goToChatBtn": "ابدأ الدردشة مع الدعم",
				"inProgress": "جارٍ المعالجة...",
				"reqError": "خطأ في الاتصال بالخادم.",
				"limitReqErorr": "عدد الرسائل المرسلة يتجاوز الحد المسموح به. يرجى المحاولة مرة أخرى لاحقًا!",
				"beta": "(تجريبي)"
			}
		}

		const langKeys = Object.keys(languages);

		lang = langKeys.includes(websiteLang) ? websiteLang : "en";

		// ---------------------------------------------

		const palleteColorProperty = scriptTag.getAttribute('palleteColor') || "#262626";
		const fontSizeProperty = scriptTag.getAttribute('fontSize') || 17;
		const welcomeTextProperty = scriptTag.getAttribute('welcomeText') || languages[lang]["welcome"];
		const themeProperty = scriptTag.getAttribute('theme') || "light";
		const showPopupProperty = scriptTag.getAttribute('showPopup') || "true";

		var cahtLog = [];
		var chat_one_time_open = false;
		var isTyping = false;
		var bot_msg_count = 0;
		var temp_msg_count = 0;
		const limit_msg_count = 5;
		const cacheChatLog = getCacheItem("chatLog");

		// تایین اندازه chat Container در گوشی
		let windowHeight = `${$(window).height()}px`;

		$(window).resize(function () {
			windowHeight = `${$(window).height()}px`;
			chatContainer.css('height', windowHeight);
		});

		// توابع
		function isMobile() {
			const widthCheck = window.innerWidth <= 768;
			return widthCheck;
		}

		function toggleFadeZoom(selector, duration = 400) {
			const $element = $(selector);

			if ($element.is(':visible')) {
				// Fade & Shrink Out
				$element.css({
					transition: `opacity ${duration}ms, width ${duration}ms, height ${duration}ms`,
					opacity: 0,
					width: 0,
					height: 0
				});
				setTimeout(() => {
					$element.hide();
				}, duration);
			} else {
				// Fade & Expand In
				$element.show().css({
					transition: `opacity ${duration}ms, width ${duration}ms, height ${duration}ms`,
					opacity: 0,
					width: 0,
					height: 0
				});
				setTimeout(() => {
					if (isMobile()) {
						$element.css({
							opacity: 1,
							width: '100%',
							height: '100%'
						});
					} else {
						$element.css({
							opacity: 1,
							width: '500px',
							height: '650px'
						});
					}
				}, 10); // Small delay to ensure the transition is applied
			}
		}

		function uniqe_id() {
			var uid = Date.now() + Math.floor(Math.random() * 1000000);

			return uid;
		}

		// ****************************************

		var uniqeId = uniqe_id();

		document.getElementsByTagName("body")[0].style.margin = "0";

		const fontSize = Number(fontSizeProperty);
		const palleteColor = palleteColorProperty;

		const chat_svg = `<svg width="46px" height="46px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="#ffffffe1" stroke-width="2.4"></path> <path opacity="0.5" d="M8 12H8.009M11.991 12H12M15.991 12H16" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
		const send_svg = `<svg xmlns="http://www.w3.org/2000/svg" style="transform: rotate(45deg);" width="${24}" height="${24}" fill="currentColor" viewBox="0 0 16 16">
			<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
		</svg>`;
		const close_svg = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
		<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
		</svg>
		`;
		// 		const bot_avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
		//   <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
		//   <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
		// </svg>`;


		// ساخت دکمه باز کردن چت
		const chatButton = $('<button>', {
			html: chat_svg,
			id: 'chatok_bouble_button',
			css: {
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				padding: '8px 8px',
				backgroundColor: palleteColor,
				color: 'white',
				border: 'none',
				borderRadius: '50%',
				cursor: 'pointer',
				boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
				zIndex: '1000',
				transition: '0.3s ease'
			}
		}).prependTo('body');

		// انیمیشن دکمه چت در بارگذاری اولیه
		chatButton.css('scale', '0');
		setTimeout(() => {
			chatButton.css('transition', 'scale 0.3s ease-in-out');
			chatButton.css('scale', '1');
		}, 1);

		chatButton.hover(
			function () {
				$(this).css('scale', '1.15');
			},
			function () {
				$(this).css('scale', '1');
			}
		);

		// ساخت پنجره چت
		const chatContainer = $('<div>', {
			id: 'chatok_chat_container',
			css: {
				position: 'fixed',
				direction: 'rtl',
				border: '1px solid #ccc',
				backgroundColor: '#fff',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
				zIndex: '9999999999999999'
			}
		}).prependTo('body');

		chatContainer.hide();

		if (isMobile()) {
			chatContainer.css({
				width: '100%',
				height: windowHeight,
			});
		} else {
			chatContainer.css({
				right: '20px',
				width: '500px',
				bottom: '20px',
				height: '650px',
				borderRadius: '12px',
				boxShadow: '0 3px 12px rgba(0,0,0,0.2)'
			});
		}

		// هدر
		const header = $('<div>', {
			html: `<span>${languages[lang]["powerBy"]} <a href="https://chatok.ir" style="color: #0099ff; padding: 0 4px;}">${languages[lang]["chatok"]}</a> ${languages[lang]["beta"]}</span>`,
			css: {
				fontSize: `${fontSize - 3}px`,
				height: '44px',
				paddingLeft: "12px",
				display: "flex",
				justifyContent: "space-between",
				flexDirection: "row-reverse",
				alignItems: "center",
				textAlign: "center",
				borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
				color: themeProperty == "dark" ? "#fff" : "#212121",
				backgroundColor: themeProperty == "dark" ? "#000" : "#f4f4f4"
			}
		}).appendTo(chatContainer);

		// دکمه بستن
		const closeButton = $('<button>', {
			html: close_svg,
			css: {
				top: '10px',
				right: '10px',
				fontSize: '32px',
				color: themeProperty == "dark" ? "#ccc" : "#424242",
				backgroundColor: 'transparent',
				border: 'none',
				padding: '4px 16px',
				cursor: 'pointer',
				zIndex: '1001'
			}
		}).appendTo(header);

		// بخش پیام‌ها
		const messagesContainer = $('<div>', {
			css: {
				flex: '1',
				fontSize: `${fontSize}px`,
				padding: '8px',
				backgroundColor: themeProperty == "dark" ? "#27272a" : "#fff",
				overflowY: 'auto'
			}
		}).appendTo(chatContainer);

		// بخش ورودی پیام
		const inputArea = $('<div>', {
			css: {
				fontSize: `${fontSize}px`,
				display: 'flex',
				backgroundColor: themeProperty == "dark" ? "#27272a" : "#fff",
				padding: '0 10px',
				paddingTop: '10px',
				alignItems: 'flex-end',
			}
		}).appendTo(chatContainer);

		// ورودی متن
		const messageInput = $('<textarea>', {
			placeholder: languages[lang]["inputPlaceholder"],
			id: "promptInput",
			rows: '1',
			maxlength: '256',
			css: {
				fontSize: `${fontSize}px`,
				flex: '1',
				padding: '12px',
				borderRadius: '8px',
				marginBottom: '12px',
				marginLeft: '10px',
				backgroundColor: themeProperty == "dark" ? "#000" : "#f1f1f1",
				color: themeProperty == "dark" ? "#fff" : "",
				border: '1px solid rgba(0, 0, 0, 0.1)',
				unicodeBidi: 'plaintext',
				outline: 'none',
				resize: 'none',
				overflow: 'hidden',
				direction: lang == "en" ? "ltr" : "rtl",
				lineHeight: '1.25',
				fontFamily: "inherit"
			}
		}).appendTo(inputArea);

		messageInput.on('input', function () {
			this.style.height = 'auto';

			if (this.scrollHeight > 50) {

				if (this.scrollHeight > 140) {
					this.style.height = '100px';
					this.style.overflowY = 'scroll';
				}
				else {
					this.style.height = (this.scrollHeight - 20) + 'px';
					this.style.overflowY = 'hidden';
				}
			}

		});

		// دکمه ارسال پیام
		const sendButton = $('<button>', {
			html: send_svg,
			css: {
				fontSize: `${fontSize}px`,
				padding: "10px 14px 6px 7px",
				borderRadius: "50%",
				marginBottom: "12px",
				transform: "scaleX(-1)",
				border: "none",
				boxShadow: "0 0 4px #00000026",
				backgroundColor: palleteColor,
				color: "white",
				cursor: "pointer",
				outline: "none",
				height: "48px",
				width: "48px"
			}
		}).appendTo(inputArea);

		// نمایش پاپ آپ اولیه

		if (showPopupProperty == "true") {
			// پیام پاپ آپ
			const popupMessage = $('<div>', {
				text: welcomeTextProperty,
				css: {
					position: 'fixed',
					bottom: '100px',
					fontSize: `${fontSize + 1}px`,
					fontWeight: '800',
					right: '20px',
					padding: '20px 52px',
					paddingLeft: '20px',
					marginLeft: '20px',
					backgroundColor: "#323232",
					color: "#fff",
					borderRadius: '5px',
					boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
					zIndex: '1000',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					direction: lang == "en" ? "ltr" : "rtl"
				}
			}).appendTo('body');

			popupMessage.hide();

			// دکمه برای رفتن به چت در پاپ آپ
			const goToChatButton = $('<button>', {
				text: languages[lang]["goToChatBtn"],
				css: {
					marginTop: '32px',
					padding: '10px 16px',
					fontSize: `${fontSize - 1}px`,
					backgroundColor: 'white',
					color: palleteColor,
					border: 'none',
					borderRadius: '3px',
					cursor: 'pointer',
					fontFamily: "inherit"
				}
			}).appendTo(popupMessage);

			goToChatButton.click(() => {
				chatButton.click();
				popupMessage.remove();
			});

			// دکمه بستن پاپ آپ
			const closePopupButton = $('<button>', {
				html: close_svg,
				css: {
					position: 'absolute',
					top: '10px',
					right: '6px',
					backgroundColor: 'transparent',
					color: 'white',
					border: 'none',
					cursor: 'pointer'
				}
			}).appendTo(popupMessage);

			closePopupButton.click(() => {
				popupMessage.fadeOut(300, "linear", () => { popupMessage.remove(); });
			});

			setTimeout(() => {
				if (chat_one_time_open == false) {
					popupMessage.fadeIn(300, "linear");
				} else {
					popupMessage.remove();
				}
			}, 7000);

			setTimeout(() => {
				if (chat_one_time_open == false) {
					popupMessage.fadeOut(300, "linear", () => { popupMessage.remove(); });
				}
			}, 14000);
		}

		// استایل پیام‌ها
		const messageDivStyle = {
			base: {
				maxWidth: '100%',
				display: 'flex',
				alignItems: 'center'
			},
			user: {
				justifyContent: 'flex-start',
			},
			assistant: {
				flexDirection: 'row-reverse',
				justifyContent: 'flex-start',
			},
		};

		const messageStyle = {
			base: {
				margin: '4px 0',
				borderRadius: '10px',
				lineHeight: '1.75',
				wordBreak: 'break-word'
			},
			user: {
				width: 'max-content',
				color: "#fff",
				padding: '8px 14px',
				borderBottomRightRadius: '0',
				backgroundColor: palleteColor,
			},
			assistant: {
				color: themeProperty == "dark" ? "#fff" : "#212121",
				padding: '8px 4px',
				borderBottomLeftRadius: '0',
				backgroundColor: themeProperty == "dark" ? "#363636" : "#fff",
				width: '100%',
			},
		};

		addMessage(welcomeTextProperty, "assistant");

		if (cacheChatLog) {
			cahtLog = cacheChatLog;
			cahtLog.forEach((msg) => {
				addMessageWithoutAnimation(msg.content, msg.role);
			});
		}

		// افزودن پیام به پنجره
		function addMessage(text, sender) {

			const messageDiv = $('<div>', {
				id: sender == "assistant" ? `bot_div_message_${bot_msg_count}` : `user_div_message_${bot_msg_count}`,
				css: { ...messageDivStyle.base, ...messageDivStyle[sender] }
			});

			const messageTextContainer = $('<div>', {
				css: { ...messageStyle.base, ...messageStyle[sender] }
			});

			const messageText = $('<p>', {
				id: sender == "assistant" ? `bot_message_${bot_msg_count}` : `user_message_${bot_msg_count}`,
				class: 'chatok-message-text',
				text: text,
				css: {
					margin: 0,
					unicodeBidi: 'plaintext'
				}
			});

			messageTextContainer.append(messageText);
			messageDiv.append(messageTextContainer);
			messagesContainer.append(messageDiv);
			messageDiv.hide();
			$(`#bot_div_message_0`).show();
			$(`#user_div_message_${bot_msg_count}`).fadeIn(300, "swing", () => { $(`#bot_div_message_${bot_msg_count}`).delay(300).fadeIn(300); });

			messagesContainer.scrollTop(messagesContainer[0].scrollHeight);

			// اسکرول به پایین
			setTimeout(() => {
				messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
			}, 610);

		}

		function addMessageWithoutAnimation(text, sender) {
			const messageDiv = $('<div>', {
				id: sender == "assistant" ? `bot_div_message_${bot_msg_count}` : `user_div_message_${bot_msg_count}`,
				css: { ...messageDivStyle.base, ...messageDivStyle[sender] }
			});

			const messageTextContainer = $('<div>', {
				css: { ...messageStyle.base, ...messageStyle[sender] }
			});

			const messageText = $('<p>', {
				id: sender == "assistant" ? `bot_message_${bot_msg_count}` : `user_message_${bot_msg_count}`,
				class: 'chatok-message-text',
				text: text,
				css: {
					margin: 0,
					unicodeBidi: 'plaintext'
				}
			});

			messageTextContainer.append(messageText);
			messageDiv.append(messageTextContainer);
			messagesContainer.append(messageDiv);
		}

		// انیمیشن دکمه چت

		setTimeout(() => {
			chatButton.css('scale', '1.35');
			setTimeout(() => {
				chatButton.css('scale', '1');
			}, 1500);

		}, 5500);

		// ---------------------------------------------

		setInterval(() => {
			temp_msg_count = 0;
		}, 60_000);

		// مدیریت ارسال پیام
		sendButton.click(async () => {

			const messageText = messageInput.val().trim();

			if (messageText.length > 1 && isTyping == false) {

				if (temp_msg_count > limit_msg_count) {
					alert(languages[lang]["limitReqErorr"])
					return;
				}

				isTyping = true;

				bot_msg_count += 1;
				temp_msg_count += 1;

				// افزودن پیام کاربر
				addMessage(messageText, "user");
				cahtLog.push({ role: "user", content: messageText });

				// پیام هنوز نرسیده به کاربر
				addMessage(languages[lang]["inProgress"], "assistant");

				// if (cahtLog.length >= 4) {
				// 	cahtLog.splice(0, 0);
				// 	cahtLog.splice(0, 0);
				// }

				messageInput.val("");

				const recentChatLog = cahtLog.slice(-5);

				await fetch("http://localhost:3000/api/chat/private", {
					method: "POST",
					body: JSON.stringify({ chats: recentChatLog, user_id: uniqeId, ipInfo })

				}).then((res) => {

					const botMsg = document.getElementById(`bot_message_${bot_msg_count}`);
					botMsg.innerText = "";

					const reader = res.body.getReader();
					const decoder = new TextDecoder();

					var lastMessage = "";

					const read = () => {
						// read the data
						reader.read().then(({ done, value }) => {
							// Result objects contain two properties:
							// value - some data. Always undefined when done is true.

							if (done) {
								cahtLog.push({ role: 'assistant', content: lastMessage });
								isTyping = false;

								setCacheItem("chatLog", cahtLog, 60);

								return;
							}

							//Main Event
							var msg_part = decoder.decode(value);

							lastMessage += msg_part;
							botMsg.innerHTML = marked.parse(lastMessage);

							// اسکرول به پایین
							messagesContainer.scrollTop(messagesContainer[0].scrollHeight);

							//
							read();
						});
					};

					read();
				}).catch((error) => {
					const botMsg = document.getElementById(`bot_message_${bot_msg_count}`);
					botMsg.innerText = languages[lang]["reqError"];
					isTyping = false;
				});
			}
		});

		// ارسال پیام با Enter
		messageInput.on("keypress", (e) => {
			if (e.shiftKey && e.key === "Enter") {
				e.preventDefault();
				messageInput.val(messageInput.val() + "\n");
			}

			if (!e.shiftKey && e.key === "Enter") {
				e.preventDefault();
				sendButton.click();
			}
		});

		sendButton.prop('disabled', true).css('backgroundColor', 'gray');

		messageInput.keyup(function () {
			if (messageInput.val().length > 1 && temp_msg_count <= limit_msg_count && isTyping == false) {
				sendButton.prop('disabled', false).css('backgroundColor', palleteColor);
			} else {
				sendButton.prop('disabled', true).css('backgroundColor', 'gray');
			}
		})

		// نمایش یا مخفی کردن چت با کلیک روی دکمه با انیمیشن

		chatButton.click(function () {

			chat_one_time_open = true;

			chatButton.toggle();

			if (isMobile()) {
				chatContainer.fadeToggle();
			} else {
				toggleFadeZoom("#chatok_chat_container");
			}

			messagesContainer.scrollTop(messagesContainer[0].scrollHeight);

			messageInput.focus();

		});

		// مخفی کردن چت با کلیک روی دکمه خروج
		closeButton.click(() => {

			chatButton.toggle();

			if (isMobile()) {
				chatContainer.fadeToggle();
			} else {
				toggleFadeZoom("#chatok_chat_container");
			}

		});

		// ****************************************

		const styles = `
			.chatok-message-text p {
				margin: 0;
			}

			.chatok-message-text h1,h2,h3,h4,h5,h6 {
				margin: 0;
			}

			.chatok-message-text h1 {
				font-size: 22px !important;
			}
				
			.chatok-message-text h2 {
				font-size: 20px !important;
			}

			.chatok-message-text h3 {
				font-size: 18px !important;
			}

			.chatok-message-text ul, ol {
				padding-right: 16px;
				margin-top: 0;
			}
		`;

		$("<style>")
			.prop("type", "text/css")
			.html(styles)
			.appendTo("head");


		markedownScript.onload = function () {
			$('.chatok-message-text').each(function () {
				const text = $(this).text();
				$(this).html(marked.parse(text));
			});
		};

		// ****************************************

		// اضافه کردن اعلان به صفحه
		history.pushState(null, null, window.location.href);

		// مدیریت رویداد back
		window.addEventListener('popstate', function () {

			chatButton.toggle();

			if (isMobile()) {
				chatContainer.fadeToggle();
			} else {
				toggleFadeZoom("#chatok_chat_container");
			}
		});
	});

};

jqueryScript.onerror = function () {
	console.error("Failed to load the script.");
};