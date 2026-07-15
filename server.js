// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { eq, and, desc, asc, ne, gt, sql } = require('drizzle-orm');

const { db, pool } = require('./db');

const {
    users,
    products,
    orders,
    favorites,
    reviews,
    passwordResetTokens,
    contactMessages,
} = require('./db/schema');

const { runMigrations } = require('./db/migrate');

let rateLimit;

try {
    rateLimit = require('express-rate-limit');
} catch {
    rateLimit = null;
}


const app = express();


// Render / Heroku / Railway gibi reverse proxy arkasında gerekli
app.set('trust proxy', 1);


const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const APP_URL =
    process.env.APP_URL ||
    `http://localhost:${PORT}`;


if (!JWT_SECRET || !ADMIN_PASSWORD) {

    console.warn(
        '⚠️ JWT_SECRET veya ADMIN_PASSWORD eksik.'
    );

    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}


// JSON limit
app.use(
    express.json({
        limit: '100kb'
    })
);


// Security headers
app.use((req,res,next)=>{

    res.setHeader(
        'X-Content-Type-Options',
        'nosniff'
    );

    res.setHeader(
        'X-Frame-Options',
        'SAMEORIGIN'
    );

    res.setHeader(
        'X-XSS-Protection',
        '1; mode=block'
    );

    res.setHeader(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
    );

    next();
});



// Rate limiter

if(rateLimit){

    app.use(
        '/api/',
        rateLimit({
            windowMs:
                15 * 60 * 1000,

            max:200,

            message:{
                mesaj:
                'Çok fazla istek. Lütfen bekleyin.'
            }
        })
    );


    app.use(
        '/api/auth/login',
        rateLimit({

            windowMs:
            15 * 60 * 1000,

            max:10,

            message:{
                mesaj:
                'Çok fazla giriş denemesi.'
            }
        })
    );


    app.use(
        '/api/auth/register',
        rateLimit({

            windowMs:
            60 * 60 * 1000,

            max:5,

            message:{
                mesaj:
                'Çok fazla kayıt denemesi.'
            }
        })
    );


    app.use(
        '/api/auth/forgot-password',
        rateLimit({

            windowMs:
            60 * 60 * 1000,

            max:3,

            message:{
                mesaj:
                'Çok fazla şifre sıfırlama isteği.'
            }
        })
    );
}



// Gizli dosya engelleme

app.use((req,res,next)=>{

    const blocked=[
        '/.env',
        '/node_modules',
        '/.git'
    ];


    if(
        blocked.some(
            p =>
            req.path===p ||
            req.path.startsWith(p+'/')
        )
    ){
        return res.status(404).end();
    }


    next();

});



// Frontend servis

app.use(
    express.static(__dirname,{
        dotfiles:'deny',
        index:false
    })
);



app.get('/',(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            'index.html'
        )
    );

});



// Health check

app.get(
'/api/health',
async(req,res)=>{

    try{

        await db.execute(
            sql`SELECT 1`
        );


        res.json({

            ok:true,

            uptime:
            process.uptime()

        });


    }catch(err){

        res.status(503).json({

            ok:false,

            mesaj:
            'Veritabanı bağlantısı yok'

        });

    }

});




// MAIL SYSTEM


const transporter =
nodemailer.createTransport({

    service:'gmail',

    auth:{

        user:
        process.env.EMAIL_USER,

        pass:
        process.env.EMAIL_PASS

    }

});



function isMailConfigured(){

    return Boolean(
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
    );

}



async function verifyMailOnStartup(){

    if(!isMailConfigured()){

        console.warn(
        '📭 Mail sistemi kapalı.'
        );

        return;
    }


    try{

        await transporter.verify();

        console.log(
        '📧 Gmail SMTP hazır.'
        );


    }catch(err){

        console.warn(
        'SMTP hatası:',
        err.message
        );

    }

}


verifyMailOnStartup();





function escapeHtml(str){

    if(str==null)
        return '';

    return String(str)

    .replace(/&/g,'&amp;')

    .replace(/</g,'&lt;')

    .replace(/>/g,'&gt;')

    .replace(/"/g,'&quot;')

    .replace(/'/g,'&#39;');

}



function sanitizeText(
str,
maxLen=500
){

    if(typeof str!=='string')
        return '';

    return str
    .trim()
    .slice(0,maxLen);

}



function isValidEmail(email){

    return typeof email==='string'
    &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}



async function sendMailSafe(options){

    if(!isMailConfigured())
        return false;


    try{

        await transporter.sendMail({

            ...options,

            from:
            options.from ||
            `"Kavrulmuş Kahve" <${process.env.EMAIL_USER}>`

        });


        return true;


    }catch(err){

        console.error(
        'Mail gönderilemedi:',
        err.message
        );


        return false;
    }

}
async function hosgeldinMailiGonder(kullanici){

    return sendMailSafe({

        to:kullanici.email,

        subject:
        "Kavrulmuş'a Hoş Geldiniz! ☕",

        html:`

        <h2>
        Merhaba ${escapeHtml(
            kullanici.ad_soyad || "Kahve Sever"
        )}
        </h2>

        <p>
        Kavrulmuş ailesine katıldığınız için teşekkür ederiz.
        </p>

        <p>
        Artık sipariş verebilir,
        favorilerinizi kaydedebilir ve yorum yapabilirsiniz.
        </p>

        `

    });

}



async function sifreSifirlamaMailiGonder(
email,
token
){

    const link =
    `${APP_URL}/sifre-sifirla.html?token=${token}`;


    return sendMailSafe({

        to:email,

        subject:
        "Şifre Sıfırlama - Kavrulmuş",

        html:`

        <h2>Şifre Sıfırlama</h2>

        <p>
        Aşağıdaki bağlantıdan şifrenizi yenileyebilirsiniz.
        </p>

        <a href="${link}">
        Şifre Yenile
        </a>

        `

    });

}





function verifyCustomer(req,res,next){

    const token =
    req.headers.authorization?.split(' ')[1];


    if(!token){

        return res.status(401).json({

            mesaj:
            "Oturum bulunamadı."

        });

    }



    jwt.verify(
        token,
        JWT_SECRET,
        (err,decoded)=>{


            if(
                err ||
                decoded.role !== 'customer'
            ){

                return res.status(403).json({

                    mesaj:
                    "Yetkisiz erişim."

                });

            }


            req.user=decoded;

            next();


        }
    );

}




function verifyAdmin(req,res,next){


    const token =
    req.headers.authorization?.split(' ')[1];


    if(!token){

        return res.status(401).json({

            mesaj:
            "Admin token bulunamadı."

        });

    }



    jwt.verify(
        token,
        JWT_SECRET,
        (err,decoded)=>{


            if(
                err ||
                decoded.role!=='admin'
            ){

                return res.status(403).json({

                    mesaj:
                    "Admin yetkisi gerekli."

                });

            }


            req.admin=decoded;

            next();


        }
    );


}




function signCustomerToken(user){

    return jwt.sign(

        {

            id:user.id,

            name:
            user.ad_soyad ||
            user.adSoyad,

            phone:
            user.telefon,

            email:
            user.email,

            role:'customer'

        },


        JWT_SECRET,


        {

            expiresIn:'2h'

        }

    );

}






// =======================
// ADMIN LOGIN
// =======================


app.post(
'/api/admin/login',
(req,res)=>{


    const {
        password
    }=req.body;



    if(
        !password ||
        password!==ADMIN_PASSWORD
    ){

        return res.status(401).json({

            mesaj:
            "Hatalı admin şifresi!"

        });

    }



    const token =
    jwt.sign(

        {
            role:'admin'
        },

        JWT_SECRET,

        {
            expiresIn:'1h'
        }

    );



    res.json({

        mesaj:
        "Admin girişi başarılı!",

        token

    });



});




app.get(
'/api/admin/verify',
verifyAdmin,
(req,res)=>{

    res.json({

        mesaj:
        "Admin aktif."

    });

});







// =======================
// ÜRÜNLER
// =======================


app.get(
'/api/urunler',
async(req,res)=>{


    try{


        const rows =
        await db
        .select()
        .from(products)
        .orderBy(
            asc(products.id)
        );


        res.json(rows);



    }catch(err){

        console.error(err);


        res.status(500).json({

            mesaj:
            "Ürünler okunamadı."

        });

    }


});





app.get(
'/api/urunler/:id',
async(req,res)=>{


    const id =
    Number(req.params.id);



    if(!id){

        return res.status(400).json({

            mesaj:
            "Geçersiz ürün."

        });

    }



    try{


        const [
            urun
        ] =
        await db
        .select()
        .from(products)
        .where(
            eq(
                products.id,
                id
            )
        );



        if(!urun){

            return res.status(404).json({

                mesaj:
                "Ürün bulunamadı."

            });

        }



        res.json(urun);



    }catch(err){

        res.status(500).json({

            mesaj:
            "Ürün hatası."

        });

    }


});







// YORUMLAR


app.get(
'/api/urunler/:id/yorumlar',
async(req,res)=>{


    const productId =
    Number(req.params.id);



    try{


        const yorumlar =
        await db
        .select()
        .from(reviews)
        .where(
            eq(
                reviews.productId,
                productId
            )
        )
        .orderBy(
            desc(reviews.tarih)
        );



        res.json(yorumlar);



    }catch(err){

        res.status(500).json({

            mesaj:
            "Yorumlar okunamadı."

        });

    }

});




app.post(
'/api/urunler/:id/yorumlar',
verifyCustomer,
async(req,res)=>{


    const productId =
    Number(req.params.id);


    const puan =
    Number(req.body.puan);


    const yorum =
    sanitizeText(
        req.body.yorum,
        1000
    );



    if(
        puan<1 ||
        puan>5 ||
        !yorum
    ){

        return res.status(400).json({

            mesaj:
            "Geçersiz yorum."

        });

    }



    try{


        await db.insert(reviews)
        .values({

            productId,

            userId:
            req.user.id,

            kullaniciAd:
            req.user.name,

            puan,

            yorum

        });



        res.json({

            mesaj:
            "Yorum eklendi."

        });



    }catch(err){

        console.error(err);


        res.status(500).json({

            mesaj:
            "Yorum eklenemedi."

        });

    }


});
app.get('/api/siparisler/takip/:id', async (req, res) => {
    const { id } = req.params;

    if (!/^KVR-\d{4}$/.test(id)) {
        return res.status(400).json({
            mesaj: 'Geçersiz takip numarası. Örnek: KVR-1234'
        });
    }

    try {
        const [row] = await db
            .select({
                id: orders.id,
                tarih: orders.tarih,
                urunler: orders.urunler,
                toplamTutar: orders.toplamTutar,
                durum: orders.durum,
            })
            .from(orders)
            .where(eq(orders.id, id));

        if (!row) {
            return res.status(404).json({
                mesaj: 'Bu takip numarasıyla sipariş bulunamadı.'
            });
        }

        res.json({
            id: row.id,
            tarih: row.tarih,
            urunler: row.urunler,
            toplamTutar: row.toplamTutar,
            durum: row.durum
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            mesaj: 'Sipariş sorgulanamadı.'
        });
    }
});


// --- API 404 ---
app.use('/api', (req, res) => {
    res.status(404).json({
        mesaj: 'API endpoint bulunamadı.'
    });
});


// --- SAYFA 404 ---
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            mesaj: 'Bulunamadı'
        });
    }

    res.status(404).sendFile(
        path.join(__dirname, '404.html')
    );
});


// --- SERVER START ---
async function startServer() {

    try {

        await runMigrations();

    } catch (err) {

        console.error(
            '❌ Veritabanı migration hatası:',
            err.message
        );

        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }


    app.listen(PORT, () => {

        console.log('=================================');
        console.log('🚀 KAVRULMUŞ BACKEND AKTİF!');
        console.log(`🌍 Sunucu adresi: ${APP_URL}`);
        console.log('=================================');

    });
}


startServer();


// --- CLEAN SHUTDOWN ---
process.on('SIGINT', async () => {

    console.log('Sunucu kapatılıyor...');

    await pool.end();

    process.exit(0);

});


process.on('SIGTERM', async () => {

    console.log('Sunucu kapatılıyor...');

    await pool.end();

    process.exit(0);

});