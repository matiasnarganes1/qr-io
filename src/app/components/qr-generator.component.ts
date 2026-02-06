import { Component, ElementRef, ViewChild, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import QRCode from 'qrcode';

type EccLevel = 'L' | 'M' | 'Q' | 'H';

@Component({
    selector: 'app-qr-generator',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './qr-generator.component.html',
})
export class QrGeneratorComponent {
    @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    // state
    value = signal('https://tusitio.com');
    size = signal(320);
    margin = signal(2);
    ecc = signal<EccLevel>('M');
    dark = signal('#111111');
    light = signal('#ffffff');
    dataUrl = signal<string>('');
    isDark = signal(false);

    // derived
    isEmpty = computed(() => !this.value().trim());
    filename = computed(() => {
        const base = this.value().trim() ? 'qr' : 'qr-empty';
        return `${base}-${new Date().toISOString().slice(0, 10)}.png`;
    });

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.initTheme();
        effect(() => {
            if (!isPlatformBrowser(this.platformId)) return; // <- clave

            // re-render when any signal changes
            void this.render();
        });
    }


    async render() {
        if (!isPlatformBrowser(this.platformId)) return;

        const text = this.value().trim();
        if (!text) { this.dataUrl.set(''); return; }

        const url = await QRCode.toDataURL(text, {
            width: this.size(),
            margin: this.margin(),
            errorCorrectionLevel: this.ecc(),
            color: { dark: this.dark(), light: this.light() },
        });

        this.dataUrl.set(url);
    }

    downloadPng() {
        const url = this.dataUrl();
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = this.filename();
        a.click();
    }

    setPreset(type: 'url' | 'wifi' | 'text') {
        if (type === 'url') this.value.set('https://tusitio.com');
        if (type === 'text') this.value.set('Hola Mati 👋 QR listo');
        if (type === 'wifi') this.value.set('WIFI:T:WPA;S:MiWifi;P:MiPassword;;');
    }

    copyText() {
        const text = this.value().trim();
        if (!text) return;
        navigator.clipboard?.writeText(text);
    }

    initTheme() {
        if (!isPlatformBrowser(this.platformId)) return;

        const saved = localStorage.getItem('theme');
        if (saved) {
            this.isDark.set(saved === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.isDark.set(prefersDark);
        }

        this.applyTheme();
    }

    applyTheme() {
        if (!isPlatformBrowser(this.platformId)) return;

        const root = document.documentElement;
        if (this.isDark()) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    toggleTheme() {
        this.isDark.update(v => !v);
        this.applyTheme();
    }
}