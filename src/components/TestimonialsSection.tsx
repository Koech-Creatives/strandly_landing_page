import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TestimonialsSection = ({ id }: { id?: string }) => {
  const testimonials = [
    {
      name: "Aisha",
      role: "Client",
      avatar: "/placeholder.svg",
      text: "Finding a stylist who truly understands my hair has always been a struggle. Strandly made it so easy! I found an amazing stylist in my city and I've never been happier with my hair.",
    },
    {
      name: "Chiamaka",
      role: "Stylist",
      avatar: "/placeholder.svg",
      text: "Strandly has been a game-changer for my business. I'm getting more bookings than ever, and I can focus on what I love doing – styling hair. The platform is so easy to use.",
    },
    {
      name: "Fatou",
      role: "Client",
      avatar: "/placeholder.svg",
      text: "I love the convenience of booking appointments through Strandly. I can see a stylist's portfolio and reviews all in one place. It's the app I've been waiting for!",
    },
  ];

  return (
    <section id={id} className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground">What Our Community is Saying</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-warm-white border-soft-caramel/20 shadow-elegant">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-cocoa-brown">{testimonial.name}</h4>
                    <p className="font-body text-sm text-cocoa-brown/80">{testimonial.role}</p>
                  </div>
                </div>
                <p className="font-body text-cocoa-brown/90 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
