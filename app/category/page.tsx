import Link from "next/link";
import { StaticCategoryData } from "../../lib/utils";
import Image from "next/image";

// Component to display a single category
const SingleCategoryComponent = ({
  category,
}: {
  category: { id: number; name: string; slug: string };
}) => {
  const { name, slug } = category;
  return (
    <li className="flex border-b-2 border-gray-400 p-3 font-sans text-gray-400">
      <Link href={`category/${slug}`}>
        <button className="flex flex-col gap-0">
          <h3 className="text-sm font-bold">{name}</h3>
        </button>
      </Link>
    </li>
  );
};

export default async function CategoryAudioListing() {
  return (
    <div className="min-h-screen bg-cyan-950 px-5 pt-4">
      <div className="relative mx-auto aspect-square size-full max-h-[720px] max-w-[725px]">
        <Image
          src="https://utfs.io/f/vfxFGWyJBql98bOaD80nHjbIJz5GeU14RsNMFW69lKCouTmc"
          alt="Beautiful Byron Bay landscape with a mountain in the background"
          fill
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 725px"
          style={{ objectFit: "cover" }}
          quality={85}
        />
      </div>
      <h1 className="mb-5 font-sans text-xl text-gray-400"> All Categories</h1>
      <ul className="border-t-2 border-black">
        {StaticCategoryData.map((category) => (
          <SingleCategoryComponent key={category.id} category={category} />
        ))}
      </ul>
    </div>
  );
}
