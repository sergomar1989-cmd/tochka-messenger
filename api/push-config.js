export default function handler(req,res){if(req.method!=='GET')return res.status(405).end();res.setHeader('Cache-Control','no-store');return res.json({publicKey:process.env.VAPID_PUBLIC_KEY||null})}
