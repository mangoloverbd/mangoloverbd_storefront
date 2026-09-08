import type { ComponentProps, CSSProperties } from "react";
import { Quote } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  image?: string;
};

type TestimonialsSectionProps = ComponentProps<"div"> & {
  testimonials: readonly Testimonial[];
};

export function TestimonialsSection({ testimonials, className, ...props }: TestimonialsSectionProps) {
  return (
    <div className={cn("mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-3 md:gap-6", className)} {...props}>
      {testimonials.map((testimonial, index) => (
        <TestimonialCard index={index} key={`${testimonial.name}-${index}`} testimonial={testimonial} />
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
  className,
  ...props
}: ComponentProps<"figure"> & {
  testimonial: Testimonial;
  index: number;
}) {
  const { quote, name, role, company, image } = testimonial;

  return (
    <figure
      className={cn(
        "group relative flex flex-col justify-between gap-6 px-8 pb-6 pt-8 text-[#19382d] shadow-xs md:translate-y-[calc(2rem*var(--t-card-index))]",
        className,
      )}
      style={{ "--t-card-index": index } as CSSProperties}
      {...props}
    >
      <div className="absolute -inset-y-4 -left-px w-px bg-[#19382d]/20" />
      <div className="absolute -inset-y-4 -right-px w-px bg-[#19382d]/20" />
      <div className="absolute -inset-x-4 -top-px h-px bg-[#19382d]/20" />
      <div className="absolute -bottom-px -right-4 -left-4 h-px bg-[#19382d]/20" />
      <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 size-3.5 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] text-[#9a711c] before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:bg-current before:content-[''] after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:bg-current after:content-['']" />

      <blockquote className="flex gap-4">
        <Quote aria-hidden="true" className="size-6 shrink-0 stroke-1 text-[#9a711c]" />
        <p className="flex-1 text-base font-normal leading-relaxed text-[#654b2f]">{quote}</p>
      </blockquote>

      <figcaption className="flex items-center gap-3">
        <Avatar className="size-10 rounded-full bg-[#e2efd8] ring-2 ring-[#19382d]/15 ring-offset-2 ring-offset-[#fbf4e8] transition-shadow group-hover:ring-[#19382d]/30">
          {image ? <AvatarImage alt="" src={image} /> : null}
          <AvatarFallback className="bg-[#e2efd8] font-bold text-[#19382d]">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="text-sm font-medium not-italic text-[#19382d]">{name}</cite>
          {role || company ? <p className="text-xs text-[#654b2f]">{role}{role && company ? ", " : null}{company ? <span className="text-[#19382d]/80">{company}</span> : null}</p> : null}
        </div>
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;
