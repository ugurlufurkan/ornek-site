// js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. CHATBOT CSS STİLLERİNİ SAYFAYA ENJEKTE ET (Sol alt köşeye ayarlı)
    const style = document.createElement('style');
    style.innerHTML = `
        /* Chatbot Butonu (Sol Alt) */
        .chatbot-btn {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 60px;
            height: 60px;
            background: var(--gold-accent);
            color: #111;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.8rem;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
            z-index: 999;
            transition: all 0.3s ease;
        }
        .chatbot-btn:hover {
            transform: scale(1.1);
        }

        /* Chatbot Penceresi (Sol Alt) */
        .chatbot-window {
            position: fixed;
            bottom: 100px;
            left: 30px;
            width: 320px;
            background: #1a1a1a;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            z-index: 999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: var(--font-body);
        }
        .chatbot-window.active {
            display: flex;
        }

        /* Chatbot Başlığı */
        .chat-header {
            background: #111;
            padding: 15px;
            border-bottom: 1px solid var(--gold-accent);
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--gold-accent);
        }
        .chat-header h3 {
            font-size: 1.1rem;
            margin: 0;
        }
        .close-chat {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }

        /* Mesajlaşma Alanı */
        .chat-body {
            height: 300px;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        /* Mesaj Balonları */
        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        .message.bot {
            background: rgba(212, 175, 55, 0.1);
            color: var(--text-light);
            border: 1px solid rgba(212, 175, 55, 0.3);
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .message.user {
            background: var(--gold-accent);
            color: #111;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
            font-weight: 500;
        }

        /* Giriş Alanı */
        .chat-footer {
            padding: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            gap: 5px;
        }
        .chat-footer input {
            flex: 1;
            padding: 10px;
            border: none;
            background: rgba(255,255,255,0.05);
            color: #fff;
            border-radius: 8px;
            outline: none;
        }
        .chat-footer button {
            background: var(--gold-accent);
            color: #111;
            border: none;
            padding: 0 15px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // 2. CHATBOT HTML YAPISINI SAYFAYA ENJEKTE ET
    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = `
        <div class="chatbot-btn" id="chatbot-btn">🤖</div>
        <div class="chatbot-window" id="chatbot-window">
            <div class="chat-header">
                <h3>Kavrulmuş Asistan</h3>
                <button class="close-chat" id="close-chat">&times;</button>
            </div>
            <div class="chat-body" id="chat-body">
                <div class="message bot">Merhaba! Ben Kavrulmuş Asistan. Size nasıl yardımcı olabilirim? (Kargo, Fiyat, Tavsiye sorabilirsiniz)</div>
            </div>
            <form class="chat-footer" id="chat-form">
                <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." autocomplete="off" required>
                <button type="submit">Gönder</button>
            </form>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // 3. JAVASCRIPT ETKİLEŞİM VE YAPAY ZEKA MANTIĞI
    const chatbotBtn = document.getElementById('chatbot-btn');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    // Pencereyi Aç / Kapat
    chatbotBtn.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Mesaj Gönderme
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userText = chatInput.value.trim();
        if (!userText) return;

        // Kullanıcı mesajını ekrana bas
        addMessage(userText, 'user');
        chatInput.value = '';

        // Botun düşünme süresi (gerçekçilik katar)
        setTimeout(() => {
            const botResponse = generateBotResponse(userText.toLowerCase());
            addMessage(botResponse, 'bot');
        }, 600);
    });

    // Ekrana Balon Ekleme Fonksiyonu
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        
        // Otomatik en alta kaydır
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Basit Kelime Avcısı (Mini Yapay Zeka)
    function generateBotResponse(text) {
        if (text.includes('kargo')) {
            return "Siparişleriniz 24 saat içerisinde MNG veya Yurtiçi Kargo ile yola çıkar. 250 TL üzeri kargomuz ücretsizdir!";
        } else if (text.includes('fiyat') || text.includes('ne kadar')) {
            return "Kahve fiyatlarımız seçtiğiniz çekirdeğe göre 320 TL ile 1150 TL arasında değişmektedir. Ürünler sayfasından detaylara bakabilirsiniz.";
        } else if (text.includes('tavsiye') || text.includes('öneri')) {
            return "Eğer sert ve yoğun seviyorsanız 'Premium Espresso Blend' tam size göre! Daha hafif ve meyvemsi tatlar arıyorsanız 'Etiyopya Yirgacheffe' denemelisiniz.";
        } else if (text.includes('merhaba') || text.includes('selam')) {
            return "Selamlar! Sizi Kavrulmuş'ta görmek ne güzel. Kahvelerimiz hakkında bir sorunuz var mı?";
        } else if (text.includes('teşekkür')) {
            return "Rica ederim, ne demek! Başka bir sorunuz olursa ben buralardayım.";
        } else {
            return "Sizi tam anlayamadım, henüz öğrenme aşamasındayım. Lütfen kargo, fiyatlar veya kahve tavsiyeleri hakkında kelimeler kullanın.";
        }
    }
});