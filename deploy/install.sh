#!/usr/bin/env bash
# Jalankan: sudo bash deploy/install.sh
set -e
cd "$(dirname "$0")/.."
apt-get update && apt-get install -y nginx curl
command -v node >/dev/null || { curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs; }
id pixelrun &>/dev/null || useradd -r -s /usr/sbin/nologin pixelrun
mkdir -p /opt/pixelrun /var/www/pixelrun
cp server/* /opt/pixelrun/ && cp web/* /var/www/pixelrun/
(cd /opt/pixelrun && npm install --omit=dev)
chown -R pixelrun /opt/pixelrun
cp deploy/pixelrun.service /etc/systemd/system/
cp deploy/nginx-pixelrun.conf /etc/nginx/sites-available/pixelrun
ln -sf /etc/nginx/sites-available/pixelrun /etc/nginx/sites-enabled/pixelrun
nginx -t && systemctl reload nginx
systemctl daemon-reload && systemctl enable --now pixelrun
echo "Selesai. Tes lokal: curl -I http://127.0.0.1:8081"
