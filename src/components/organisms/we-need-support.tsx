import { ReactNode } from "react";
interface CardProps {
  title: string;
  image: string;
  children: ReactNode;
}

const Card = ({title, image, children}: CardProps) => {
  return <div>
    <img src={image} alt="" />
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
}

export const WeNeedSupport = (): React.ReactNode => {
  return <section>
    <div>
      <p>Why We Need Your Support</p>
      <span></span>
      <h2>Because They Deserve Better</h2>
      <p>Every child deserves a safe, healthy, and fair start in life. 
        Yet millions around the world still face challenges that 
        deny them access to education, protection, and basic needs.</p>
    </div>
    <div>
      <Card 
        title="Limited Access to Quality Education" 
        image="/book.png">
          Over 200 million children globally lack access to safe, inclusive, and quality learning environments.
      </Card>
      <Card 
        title="Youth Unemployment Challenges" 
        image="/book.png">
          1 in 5 young people are not engaged in education, employment, or training, limiting their future prospects.
      </Card>
      <Card 
        title="Health Risks in Early Childhood" 
        image="/worker.png">
          More than 15% of children under age 5 suffer from preventable diseases due to lack of healthcare access.
      </Card>
      <Card 
        title="Lack of Safe Recreational Spaces" 
        image="/baby.png">
          Millions of children grow up without safe spaces to play, socialize, and explore their potential.
      </Card>
    </div>
  </section>;
};
