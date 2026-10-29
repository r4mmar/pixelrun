# Pixel Run Online

Platformer 2D multiplayer, pixel art. Server game: Node.js + WebSocket. Nginx menyajikan file statis dan meneruskan `/ws`. Cloudflare Tunnel membuka situs ke internet tanpa membuka port.

## Pasang
1. Unggah folder ini ke server, lalu: `sudo bash deploy/install.sh`
2. Tes lokal: `curl -I http://127.0.0.1:8081` (harus 200)
3. Cloudflare Tunnel (pasang cloudflared dulu sesuai dokumentasi Cloudflare):
   ```
   cloudflared tunnel login
   cloudflared tunnel create pixelrun
   cloudflared tunnel route dns pixelrun game.domainanda.com
   ```
   Salin `deploy/cloudflared-config.yml` ke `/etc/cloudflared/config.yml`, isi tunnel ID dan hostname,
   salin juga file kredensial `<ID>.json` ke path yang tertulis, lalu:
   ```
   sudo cloudflared service install
   sudo systemctl start cloudflared
   ```
4. Buka `https://game.domainanda.com` di HP dan laptop.

## Operasi
- Log server: `journalctl -u pixelrun -f`
- Ubah level: edit `web/level.json`, salin ke `/var/www/pixelrun/`, lalu `sudo systemctl restart pixelrun`
- Kontrol: ← → / A D, spasi atau ↑ untuk lompat. Di HP: tombol layar.
