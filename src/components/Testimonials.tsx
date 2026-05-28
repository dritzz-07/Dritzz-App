import { Star } from "lucide-react";

const reviews = [
  {
    stars: 5,
    text: "Absolutely loved the service! They arrived right on time and my car looked brand new. The interior detailing was exceptional.",
    author: "Ravi Shankar",
    location: "Banjara Hills, Hyderabad",
  },
  {
    stars: 5,
    text: "Finally a car wash service that actually comes to you. Booked online in 2 minutes, paid via UPI, and the guys did an amazing job.",
    author: "Priya Reddy",
    location: "Madhapur, Hyderabad",
  },
  {
    stars: 4,
    text: "Great value for money. Booked the Elite package for my SUV. The team was professional and thorough. Will definitely rebook.",
    author: "Kiran Mehta",
    location: "Kondapur, Hyderabad",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-black px-6 md:px-16 py-16 md:py-24 border-t border-white/5">
      <div className="section-label">What Customers Say</div>
      <h2 className="section-title">REVIEWS</h2>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-2xl shadow-sm"
          >
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3 h-3 ${idx < review.stars ? "fill-white text-white" : "text-neutral-800"}`}
                />
              ))}
            </div>
            <p className="text-neutral-100 italic mb-10 leading-relaxed text-[0.95rem]">
              "{review.text}"
            </p>
            <div>
              <div className="font-bold text-xs tracking-wide text-white">
                {review.author}
              </div>
              <div className="text-xs uppercase tracking-widest text-neutral-300 mt-2 font-bold">
                {review.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Swipe View */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 mt-12 hide-scrollbar">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[80vw] max-w-[320px] bg-white/5 border border-white/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between relative"
          >
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3 h-3 ${idx < review.stars ? "fill-white text-white" : "text-neutral-800"}`}
                  />
                ))}
              </div>
              <p className="text-neutral-100 italic mb-6 leading-relaxed text-[13px]">
                "{review.text}"
              </p>
            </div>
            <div>
              <div className="font-bold text-[11px] tracking-wide text-white">
                {review.author}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-neutral-400 mt-1 font-bold">
                {review.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
