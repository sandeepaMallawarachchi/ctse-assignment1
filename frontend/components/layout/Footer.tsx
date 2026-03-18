import { Copyright, Facebook, Instagram, Linkedin, SendHorizontal, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const accountLinks = ["My Account", "Login / Register", "Cart", "Wishlist", "Shop"] as const;
const quickLinks = ["Privacy Policy", "Terms Of Use", "FAQ", "Contact"] as const;

export default function Footer() {
  return (
    <footer className="mt-14 bg-black text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-14 md:px-8 md:py-18">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-5 text-center md:text-left">
            <Image
              src="/logo.webp"
              alt="Exclusive logo"
              width={150}
              height={44}
              className="mx-auto w-[120px] md:mx-0"
            />
            <h3 className="font-medium">Subscribe</h3>
            <p className="text-white/95">Get 10% off your first order</p>

            <form className="flex h-14 items-center justify-between rounded border border-white/70 px-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border-none bg-transparent text-white placeholder:text-white/45 outline-none"
              />
              <button type="submit" aria-label="Submit email" className="ml-3 text-white">
                <SendHorizontal size={24} />
              </button>
            </form>
          </div>

          <div className="space-y-4 md:text-left text-center">
            <h3 className="font-medium">Support</h3>
            <p className="leading-relaxed text-white/95">123, Colombo, Sri Lanka</p>
            <p className="text-white/95">exclusive@gmail.com</p>
            <p className="text-white/95">+1123456789</p>
          </div>

          <div className="space-y-4 md:text-left text-center">
            <h3 className="font-medium">Account</h3>
            <div className="space-y-3">
              {accountLinks.map((item) => (
                <p key={item}>
                  <Link href="#" className="text-white/95 hover:underline">
                    {item}
                  </Link>
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:text-left text-center">
            <h3 className="font-medium">Quick Link</h3>
            <div className="space-y-3">
              {quickLinks.map((item) => (
                <p key={item}>
                  <Link href="#" className="text-white/95 hover:underline">
                    {item}
                  </Link>
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:text-left text-center">
            <h3 className="font-medium">Download App</h3>
            <p className="text-base text-white/70">Save LKR 3 with App New User</p>

            <div className="flex md:items-start md:justify-start justify-center gap-3">
              <Image src="/footer/qr.webp" alt="QR code" width={90} height={90} className="h-[90px] w-[90px]" />

              <div className="space-y-2">
                <Link href="#" className="block">
                  <Image
                    src="/footer/gplay.webp"
                    alt="Get it on Google Play"
                    width={124}
                    height={40}
                    className="h-10 w-[124px]"
                  />
                </Link>
                <Link href="#" className="block">
                  <Image
                    src="/footer/astore.webp"
                    alt="Download on the App Store"
                    width={124}
                    height={40}
                    className="h-10 w-[124px]"
                  />
                </Link>
              </div>
            </div>

            <div className="flex items-center md:justify-start justify-center gap-5 pt-1">
              <Link href="#" aria-label="Facebook" className="text-white/95 hover:text-white">
                <Facebook size={26} strokeWidth={1.8} />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-white/95 hover:text-white">
                <Twitter size={26} strokeWidth={1.8} />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-white/95 hover:text-white">
                <Instagram size={26} strokeWidth={1.8} />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-white/95 hover:text-white">
                <Linkedin size={26} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="flex items-center justify-center gap-2 text-lg text-white/40">
          <Copyright size={20} /> Copyright 2026. All right reserved
        </p>
      </div>
    </footer>
  );
}
