import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Card, CardMedia, Box } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import event1 from "/events/event1.jpg";
import event2 from "/events/event2.jpg";
import event3 from "/events/event3.jpg";
import event4 from "/events/event4.jpg";
import event5 from "/events/event5.jpg";
import event6 from "/events/event6.jpg";
import event7 from "/events/event7.jpg";
import event8 from "/events/event8.jpg";

const events = [
  { id: 1, image: event1 },
  { id: 2, image: event2 },
  { id: 3, image: event3 },
  { id: 4, image: event4 },
  { id: 5, image: event5 },
  { id: 6, image: event6 },
  { id: 7, image: event7 },
  { id: 8, image: event8 },
];

export default function EventCarousel() {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <Carousel
      swipeable={false}
      draggable={false}
      showDots={true}
      responsive={responsive}
      infinite={true}
      autoPlay={true}
      autoPlaySpeed={5000}
      keyBoardControl={true}
      transitionDuration={500}
    >
      {events.map(({ id, image }) => {
        return (
          <Box sx={{ width: "100%", height: "100%", px: 0.5 }} key={id}>
            <Card sx={{ width: "100%", height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image={image}
                alt="이벤트 이미지"
              />
            </Card>
          </Box>
        );
      })}
    </Carousel>
  );
}
