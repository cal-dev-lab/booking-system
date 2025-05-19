
import { fetchAllPageSlugs, fetchPageBySlug } from "@/lib/api";
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export const dynamic = 'force-static'; // Enforce static generation

export async function generateStaticParams() {
  const slugs = await fetchAllPageSlugs(); // must return array of slugs
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }) {
  const { slug } = params;
  const page = await fetchPageBySlug(slug);

  if (!page) {
    return <div>Page not found</div>;
  }

  const { title, content, image } = page;
  const htmlContent = marked.parse(content || '').replace(/\n/g, '<br />');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {/* Optional image rendering */}
      <div className="prose">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}





{/* 
        @TODO: Add image CDN for better performance
        {image && (
          <img
            src={image.url.startsWith('http') ? image.url : `http://localhost:1337/${image.url}`}
            alt={title}
            className="w-full mb-4 rounded"
          />
        )}
      */}

