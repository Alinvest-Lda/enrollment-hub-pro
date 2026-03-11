import { Helmet } from "react-helmet-async";
import { Course, formatCurrency } from "@/lib/courses-data";

interface CourseJsonLdProps {
  course: Course;
}

const CourseJsonLd = ({ course }: CourseJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "ALINVEST S.U. LDA",
      url: "https://alinvest-group.com",
    },
    ...(course.startDate && {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Blended",
        startDate: course.startDate,
        duration: `P${course.durationWeeks}W`,
      },
    }),
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: course.currency,
      availability: "https://schema.org/InStock",
    },
    timeRequired: `P${course.durationWeeks}W`,
    coursePrerequisites: "Nenhum pré-requisito específico",
    educationalLevel: "Professional",
    inLanguage: "pt-MZ",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export const CoursesListJsonLd = ({ courses }: { courses: Course[] }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cursos ALINVEST",
    description: "Cursos de formação profissional em gestão, normas ISO, HSEQ e liderança",
    numberOfItems: courses.length,
    itemListElement: courses.map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description,
        url: `https://enrollment-hub-pro.lovable.app/curso/${course.id}`,
        provider: {
          "@type": "Organization",
          name: "ALINVEST S.U. LDA",
        },
        offers: {
          "@type": "Offer",
          price: course.price,
          priceCurrency: course.currency,
        },
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default CourseJsonLd;
