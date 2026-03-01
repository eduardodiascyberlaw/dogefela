"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dog,
  TreePine,
  Bath,
  Hotel,
  GraduationCap,
  Phone,
  Instagram,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  Menu,
  X,
  LogIn,
  PawPrint,
  Heart,
  Star,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

// ─── Navbar ────────────────────────────────────────────────────────

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#servicos", label: "Servicos" },
    { href: "#sobre", label: "Sobre" },
    { href: "#packs", label: "Packs" },
    { href: "#galeria", label: "Galeria" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Dog Fella - Creche Canina"
              width={180}
              height={60}
              className="h-12 md:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-full hover:bg-sky-500 transition-colors"
            >
              <LogIn size={16} />
              Area Reservada
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-gray-700"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-sky-100 shadow-lg"
        >
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-full font-medium"
            >
              <LogIn size={16} />
              Area Reservada
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

// ─── Hero ──────────────────────────────────────────────────────────

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/dogs-hero.png"
          alt="Dog Fella - Creche Canina em Santo Tirso"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/30" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="text-amber-400" size={24} />
              <span className="text-amber-300 font-medium text-sm tracking-wider uppercase">
                Creche Canina em Santo Tirso
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              A Segunda Casa do Seu{" "}
              <span className="text-sky-400">Melhor</span>{" "}
              <span className="text-amber-400">Amigo</span>
            </h1>
            <p className="text-lg text-gray-200 mb-4 max-w-lg">
              Na Dog Fella, o seu patudo brinca, socializa e e tratado com todo
              o carinho enquanto voce esta descansado. Porque eles merecem o
              melhor!
            </p>
            <p className="text-2xl font-bold text-amber-400 mb-8 italic">
              &quot;We Let The Dogs Out!&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/351910122469?text=Ola! Gostaria de saber mais sobre a creche canina Dog Fella."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-500 transition-all shadow-lg shadow-green-600/25 hover:shadow-green-600/40"
              >
                <Phone size={20} />
                Fale Connosco no WhatsApp
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Ver Servicos
                <ChevronRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <PawPrint className="text-white/50" size={28} />
      </motion.div>
    </section>
  );
};

// ─── Services ──────────────────────────────────────────────────────

const serviceCategories = [
  {
    icon: <Dog className="text-sky-600" size={32} />,
    title: "Creche Canina",
    tag: "CRECHE",
    description:
      "O seu cao passa o dia a brincar, socializar e a ser acompanhado por profissionais dedicados. Ambiente seguro e divertido!",
    pricing: [
      { label: "Dia inteiro", price: "15" },
      { label: "Meio dia", price: "10" },
      { label: "Hora extra", price: "3" },
    ],
    color: "from-sky-500 to-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-100",
    dotColor: "bg-sky-400",
  },
  {
    icon: <TreePine className="text-green-600" size={32} />,
    title: "Passeios",
    tag: "PASSEIOS",
    description:
      "Passeios individuais ou em grupo pela natureza. O seu patudo gasta energia e volta feliz para casa!",
    pricing: [
      { label: "Individual", price: "8" },
      { label: "Grupo", price: "6" },
      { label: "Aventura", price: "15" },
    ],
    color: "from-green-500 to-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-100",
    dotColor: "bg-green-400",
  },
  {
    icon: <Bath className="text-cyan-600" size={32} />,
    title: "Banho & Tosa",
    tag: "BANHO_TOSA",
    description:
      "Servico de parceiro certificado. O seu cao fica limpinho, cheiroso e com um look impecavel!",
    pricing: [
      { label: "Banho", price: "12" },
      { label: "Tosa completa", price: "30" },
    ],
    color: "from-cyan-500 to-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-100",
    dotColor: "bg-cyan-400",
    badge: "Parceiro",
  },
  {
    icon: <Hotel className="text-amber-600" size={32} />,
    title: "Hotel Canino",
    tag: "HOTEL",
    description:
      "Vai de ferias? O seu melhor amigo fica connosco! Pernoitas com acompanhamento 24h e muito mimo.",
    pricing: [
      { label: "Pernoita", price: "20" },
      { label: "Fim de semana", price: "50" },
      { label: "Semana", price: "90" },
    ],
    color: "from-amber-500 to-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    dotColor: "bg-amber-400",
  },
  {
    icon: <GraduationCap className="text-purple-600" size={32} />,
    title: "Adestramento",
    tag: "ADESTRAMENTO",
    description:
      "Treino comportamental e obediencia com metodos positivos. Brevemente disponivel!",
    pricing: [],
    color: "from-purple-500 to-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
    dotColor: "bg-purple-400",
    comingSoon: true,
  },
];

const Services = () => {
  return (
    <section id="servicos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-medium text-sm tracking-wider uppercase">
            Os Nossos Servicos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Tudo o que o seu patudo precisa
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Desde a creche diaria ate ao hotel para ferias, temos servicos
            pensados para o bem-estar e felicidade do seu cao.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative bg-white rounded-2xl border ${cat.borderColor} p-8 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 ${cat.comingSoon ? "opacity-80" : ""}`}
            >
              {cat.comingSoon && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  BREVEMENTE
                </div>
              )}
              {cat.badge && !cat.comingSoon && (
                <div className="absolute top-4 right-4 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {cat.badge}
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl ${cat.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {cat.title}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    {cat.description}
                  </p>
                </div>
              </div>
              {cat.pricing.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {cat.pricing.map((p) => (
                    <li
                      key={p.label}
                      className="flex items-center justify-between text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
                        {p.label}
                      </div>
                      <span className="font-bold text-gray-900">{p.price}&euro;</span>
                    </li>
                  ))}
                </ul>
              )}
              {cat.comingSoon && (
                <div className="mt-4 text-center py-3 bg-purple-50 rounded-xl">
                  <p className="text-purple-600 font-medium text-sm">
                    Em breve disponivel! Fique atento.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── About ─────────────────────────────────────────────────────────

const About = () => {
  return (
    <section id="sobre" className="py-24 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/dogs-checkin.jpg"
                alt="Check-in de cao na Dog Fella"
                width={600}
                height={600}
                className="object-cover w-full"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-sky-600 text-white rounded-2xl p-6 shadow-xl">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sky-200 text-sm">Dedicacao canina</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-500 font-medium text-sm tracking-wider uppercase">
              Sobre a Dog Fella
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              We Let The Dogs Out!
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                A Dog Fella nasceu do amor incondicional pelos caes e da vontade
                de criar um espaco onde eles possam ser verdadeiramente felizes.
                Em Santo Tirso, construimos um ambiente seguro, estimulante e
                cheio de carinho para o seu melhor amigo.
              </p>
              <p>
                Acreditamos que cada cao e unico e merece atencao
                individualizada. A nossa equipa acompanha cada patudo com
                dedicacao, garantindo que passam o dia a brincar, socializar e a
                receber todo o mimo que merecem.
              </p>
              <p>
                Seja na creche diaria, nos passeios pela natureza ou no hotel
                canino, o seu cao esta sempre em boas maos. Porque na Dog Fella,
                os caes nao sao so clientes - sao familia!
              </p>
            </div>
            <div className="flex items-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">5</p>
                <p className="text-sm text-gray-500">Servicos</p>
              </div>
              <div className="w-px h-12 bg-sky-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">
                  <Heart className="inline text-red-500 mr-1" size={20} />
                  100%
                </p>
                <p className="text-sm text-gray-500">Amor canino</p>
              </div>
              <div className="w-px h-12 bg-sky-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">24h</p>
                <p className="text-sm text-gray-500">Acompanhamento</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Packs ─────────────────────────────────────────────────────────

const packs = [
  {
    name: "Pack Mensal Creche",
    description: "20 dias de creche canina",
    price: "250",
    originalPrice: "300",
    savings: "Poupe 50",
    features: [
      "20 dias de creche completa",
      "Brincadeiras e socializacao diaria",
      "Acompanhamento personalizado",
      "Flexibilidade de horarios",
    ],
    accent: "sky",
    popular: true,
  },
  {
    name: "Pack Semanal",
    description: "5 dias de creche canina",
    price: "65",
    originalPrice: "75",
    savings: "Poupe 10",
    features: [
      "5 dias de creche completa",
      "Ideal para semanas ocupadas",
      "Atividades variadas todos os dias",
      "Relatorio diario do patudo",
    ],
    accent: "green",
    popular: false,
  },
  {
    name: "Pack Creche + Banho",
    description: "10 dias de creche + 2 banhos",
    price: "170",
    originalPrice: "",
    savings: "Combo especial",
    features: [
      "10 dias de creche canina",
      "2 banhos incluidos",
      "Patudo sempre limpinho",
      "Melhor valor combinado",
    ],
    accent: "cyan",
    popular: false,
  },
  {
    name: "Pack Hotel Ferias",
    description: "14 noites de hotel canino",
    price: "230",
    originalPrice: "280",
    savings: "Poupe 50",
    features: [
      "14 noites com acompanhamento 24h",
      "Passeios diarios incluidos",
      "Perfeito para as suas ferias",
      "Atualizacoes com fotos do patudo",
    ],
    accent: "amber",
    popular: false,
  },
];

const accentColors: Record<string, { border: string; bg: string; text: string; button: string; badge: string; star: string }> = {
  sky: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    button: "bg-sky-600 hover:bg-sky-500",
    badge: "bg-sky-600",
    star: "text-sky-400",
  },
  green: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-400",
    button: "bg-green-600 hover:bg-green-500",
    badge: "bg-green-600",
    star: "text-green-400",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    button: "bg-cyan-600 hover:bg-cyan-500",
    badge: "bg-cyan-600",
    star: "text-cyan-400",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    button: "bg-amber-600 hover:bg-amber-500",
    badge: "bg-amber-600",
    star: "text-amber-400",
  },
};

const Packs = () => {
  return (
    <section id="packs" className="py-24 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-400 font-medium text-sm tracking-wider uppercase">
            Packs Especiais
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            Poupe com os nossos packs
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Packs pensados para quem quer o melhor para o seu patudo a um preco
            mais amigo. Mais dias, mais diversao, mais poupanca!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {packs.map((pack, i) => {
            const colors = accentColors[pack.accent];
            return (
              <motion.div
                key={pack.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border ${colors.border} overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-2xl`} />
                {pack.popular && (
                  <div className={`absolute top-4 right-4 ${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    MAIS POPULAR
                  </div>
                )}
                <div className="relative">
                  <span className={`${colors.text} text-sm font-medium tracking-wider uppercase`}>
                    {pack.savings}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-1">
                    {pack.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{pack.description}</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className={`text-4xl font-bold ${colors.text}`}>
                      {pack.price}
                    </span>
                    <span className={`${colors.text} text-xl mb-1`}>&euro;</span>
                    {pack.originalPrice && (
                      <span className="text-gray-500 line-through text-lg mb-1">
                        {pack.originalPrice}&euro;
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pack.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className={`${colors.star} flex-shrink-0 mt-0.5`} size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/351910122469?text=Ola! Gostaria de saber mais sobre o ${pack.name}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 ${colors.button} text-white font-semibold rounded-full transition-colors text-sm`}
                  >
                    Quero este pack
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Coming Soon (Adestramento) ────────────────────────────────────

const ComingSoon = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-sky-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-white" size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">
                  Adestramento Canino
                </h3>
                <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  BREVEMENTE
                </span>
              </div>
              <p className="text-white/80 max-w-lg">
                Em breve, vamos oferecer treino comportamental e obediencia com
                metodos positivos. Treino individual e em grupo para caes de
                todas as idades. Fique atento!
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/351910122469?text=Ola! Gostaria de ser informado quando o servico de adestramento estiver disponivel."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-semibold rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            Quero ser avisado
            <ArrowRight size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Gallery ──────────────────────────────────────────────────────

const Gallery = () => {
  return (
    <section id="galeria" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-medium text-sm tracking-wider uppercase">
            Galeria
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Os nossos patudos em acao
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Veja como os caes se divertem na Dog Fella. Dias cheios de
            brincadeiras, amizades e muita alegria!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl shadow-xl group"
          >
            <Image
              src="/images/dogs-gallery.png"
              alt="Colagem de caes na Dog Fella"
              width={800}
              height={600}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-6 left-6">
                <p className="text-white font-bold text-lg">Dias de diversao</p>
                <p className="text-white/80 text-sm">Os nossos amigos de quatro patas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl shadow-xl group"
          >
            <Image
              src="/images/dogs-relaxing.jpg"
              alt="Caes a relaxar na Dog Fella"
              width={800}
              height={600}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-6 left-6">
                <p className="text-white font-bold text-lg">Momentos de descanso</p>
                <p className="text-white/80 text-sm">Relaxamento apos um dia de brincadeiras</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="https://instagram.com/dogfella.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-50 text-sky-600 font-medium rounded-full hover:bg-sky-100 transition-colors"
          >
            <Instagram size={20} />
            Veja mais no nosso Instagram
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Contact ───────────────────────────────────────────────────────

const Contact = () => {
  return (
    <section id="contacto" className="py-24 bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-medium text-sm tracking-wider uppercase">
            Contacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Venha conhecer a Dog Fella
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Estamos a sua espera em Santo Tirso! Entre em contacto para saber
            mais ou agendar uma visita ao nosso espaco.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          <motion.a
            href="https://wa.me/351910122469"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl hover:shadow-lg transition-all border border-sky-100"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Phone className="text-green-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-gray-600 text-sm">910 122 469</p>
          </motion.a>

          <motion.a
            href="https://instagram.com/dogfella.pt"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl hover:shadow-lg transition-all border border-sky-100"
          >
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Instagram className="text-pink-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Instagram</h3>
            <p className="text-gray-600 text-sm">@dogfella.pt</p>
          </motion.a>

          <motion.a
            href="mailto:dogfella.pt@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl hover:shadow-lg transition-all border border-sky-100"
          >
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mb-4">
              <Mail className="text-sky-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600 text-sm">dogfella.pt@gmail.com</p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-sky-100"
          >
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <MapPin className="text-amber-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Morada</h3>
            <p className="text-gray-600 text-sm">
              Rua Varziela, 72
              <br />
              Santo Tirso, 4780-560
            </p>
          </motion.div>
        </div>

        {/* Schedule + Map */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-sky-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-sky-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Horario</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-700 font-medium">Segunda a Sexta</span>
                <span className="text-sky-600 font-bold">7h30 - 20h00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-700 font-medium">Sabado</span>
                <span className="text-sky-600 font-bold">9h00 - 13h00</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700 font-medium">Domingo</span>
                <span className="text-gray-400 font-medium">Encerrado</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <Sparkles className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                Hotel canino com acompanhamento 24h, incluindo fins de semana e
                feriados!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl shadow-lg border border-sky-100"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.5!2d-8.4775!3d41.3431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRua+Varziela+72+Santo+Tirso!5e0!3m2!1spt-PT!2spt!4v1700000000000!5m2!1spt-PT!2spt"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "350px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localizacao Dog Fella - Santo Tirso"
            />
          </motion.div>
        </div>

        {/* CTA WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://wa.me/351910122469?text=Ola! Gostaria de agendar uma visita a Dog Fella."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-green-600 text-white font-bold rounded-full hover:bg-green-500 transition-all shadow-lg shadow-green-600/25 hover:shadow-green-600/40 text-lg"
          >
            <Phone size={24} />
            Agende uma Visita pelo WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Footer ────────────────────────────────────────────────────────

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Image
              src="/images/logo.png"
              alt="Dog Fella"
              width={140}
              height={50}
              className="h-12 w-auto brightness-200"
            />
            <p className="text-gray-500 text-sm italic">
              &quot;We Let The Dogs Out!&quot;
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center gap-2 text-sm">
            <a href="#servicos" className="hover:text-sky-400 transition-colors">
              Servicos
            </a>
            <a href="#packs" className="hover:text-sky-400 transition-colors">
              Packs
            </a>
            <a href="#contacto" className="hover:text-sky-400 transition-colors">
              Contacto
            </a>
          </div>

          {/* Social + copyright */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/dogfella.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:dogfella.pt@gmail.com"
                className="hover:text-sky-400 transition-colors"
              >
                <Mail size={20} />
              </a>
              <a
                href="https://wa.me/351910122469"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors"
              >
                <Phone size={20} />
              </a>
            </div>
            <p className="text-sm text-center md:text-right">
              &copy; {new Date().getFullYear()} Dog Fella &mdash; Creche Canina.
              <br />
              Todos os direitos reservados.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            Rua Varziela, 72, Santo Tirso, Portugal, 4780-560 &bull; Tel: 910 122 469 &bull; dogfela.pt
          </p>
        </div>
      </div>
    </footer>
  );
};

// ─── Floating WhatsApp Button ──────────────────────────────────────

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href="https://wa.me/351910122469?text=Ola! Gostaria de saber mais sobre a Dog Fella."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-colors"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Contactar pelo WhatsApp"
    >
      <Phone size={24} />
    </motion.a>
  );
};

// ─── Page ──────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Packs />
      <ComingSoon />
      <Gallery />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
