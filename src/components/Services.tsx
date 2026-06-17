import { motion } from "motion/react";
import {
  Droplets,
  Sparkles,
  Wind,
  SprayCan,
  PaintBucket,
  CircleDashed,
} from "lucide-react";

const SERVICES = [
  {
    id: "exterior-wash",
    title: "Exterior Wash",
    description:
      "High-pressure foam wash to remove dirt, grit, and grime without scratching your paint.",
    icon: Droplets,
    color: "from-zinc-400 to-cyan-400",
  },
  {
    id: "interior-cleaning",
    title: "Interior Vacuuming",
    description:
      "Deep vacuuming of seats, carpets, and boot to remove dust and debris.",
    icon: Wind,
    color: "from-orange-500 to-amber-400",
  },
  {
    id: "dashboard-polish",
    title: "Dashboard Polish",
    description:
      "Restoration and UV protection for plastics, vinyl, and dashboard components.",
    icon: SprayCan,
    color: "from-zinc-500 to-pink-400",
  },
  {
    id: "stain-removal",
    title: "Dry Cleaning",
    description:
      "Intensive deep cleaning and stain removal for fabric and leather upholstery.",
    icon: Sparkles,
    color: "from-indigo-500 to-zinc-300",
  },
  {
    id: "waxing",
    title: "Wax & Polish",
    description:
      "Premium liquid wax application for long-lasting shine and environmental protection.",
    icon: PaintBucket,
    color: "from-zinc-400 to-zinc-300",
  },
  {
    id: "tyre-alloy",
    title: "Tyre & Alloy Care",
    description:
      "Deep rim cleaning and tire dressing for a gloss black finish.",
    icon: CircleDashed,
    color: "from-zinc-400 to-zinc-600",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-16 md:py-24 px-6 md:px-16 relative bg-[#0A0A0C]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">
              Our Services
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light mb-6 uppercase tracking-tight text-white/90"
          >
            Dritzz{" "}
            <span className="font-bold relative">
              Services
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-zinc-400"></span>
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#a59b9b] max-w-2xl mx-auto font-light leading-relaxed border-none"
          >
            Experience premium doorstep car care. We use industry-leading
            equipment and sustainable products to give your vehicle the showroom
            finish it deserves.
          </motion.p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm h-full flex flex-col justify-start">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors duration-500" />
                    <motion.div
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} p-[1px] group-hover:scale-110 transition-transform duration-500`}
                      whileHover={{ rotate: 5 }}
                    >
                      <div className="w-full h-full bg-[#0A0A0C] rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white relative z-10" />
                      </div>
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white tracking-wide">
                    {service.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe View */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 hide-scrollbar">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="snap-center shrink-0 w-[80vw] max-w-[300px] bg-black/40 border border-white/10 rounded-2xl p-5 relative flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 relative">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} p-[1px]`}
                    >
                      <div className="w-full h-full bg-[#0A0A0C] rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold mb-1.5 text-white">
                    {service.title}
                  </h3>
                  <p className="text-neutral-400 text-[13px] leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
