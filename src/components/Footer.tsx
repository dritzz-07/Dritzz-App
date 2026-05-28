import { Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/images/regenerated_image_1779294281601.png";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-black border-t border-white/5 pt-16 pb-8 px-6 md:px-16 text-neutral-300"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
        {/* Brand & Setup */}
        <div className="flex flex-col items-start text-left">
          <Link to="/" className="mb-6 flex items-center gap-3">
            <img
              src={logoImage}
              alt="Dritzz Logo"
              className="w-[60px] h-[60px]"
              loading="lazy"
            />
            <span className="font-bold uppercase tracking-widest text-white italic text-left text-[18px] leading-[24px]">
              Dritzz
            </span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/admin"
              className="text-xs uppercase tracking-wider font-bold text-neutral-500 hover:text-white transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-start text-left">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">
            Company
          </h3>
          <ul className="space-y-4 text-sm w-full">
            <li>
              <Link
                to="/about-us"
                className="hover:text-white transition-colors block py-1"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact-us"
                className="hover:text-white transition-colors block py-1"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-white transition-colors block py-1"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-and-conditions"
                className="hover:text-white transition-colors block py-1"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                to="/refund-policy"
                className="hover:text-white transition-colors block py-1"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col items-start text-left w-full">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-6">
            Get in Touch
          </h3>
          <ul className="space-y-4 text-sm w-full">
            <li className="w-full">
              <a
                href="https://wa.me/917075504625"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-start gap-3 bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 px-4 py-2.5 rounded-xl transition-all group w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-semibold text-white tracking-wide">
                  Live Chat on WhatsApp
                </span>
              </a>
            </li>
            <li>
              <a
                href="tel:+917075504625"
                className="flex items-center justify-start gap-3 hover:text-white transition-colors py-1"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>+91 7075504625</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:dritzz.info@gmail.com"
                className="flex items-center justify-start gap-3 hover:text-white transition-colors py-1"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="break-all">dritzz.info@gmail.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://dritzz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-start gap-3 hover:text-white transition-colors py-1"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>https://dritzz.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-center text-center">
        <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
          &copy; 2026 Dritzz. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
