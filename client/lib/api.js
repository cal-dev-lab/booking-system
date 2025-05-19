import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api";

export const fetchServices = async () => {
  const res = await axios.get(`${API_URL}/services?populate=*`);
  return res.data.data;
};

export const fetchPages = async () => {
  const res = await axios.get(`${API_URL}/pages?populate=*`);
  return res.data.data;
};

export const fetchPageBySlug = async (slug) => {
  const res = await axios.get(`${API_URL}/pages?filters[slug][$eq]=${slug}&populate=*`);
  return res.data.data[0];
};

export async function fetchAllPageSlugs() {
  const res = await fetch(`${API_URL}/pages?populate=*`); // or your CMS URL
  const json = await res.json();
  return json.data.map((page) => page.slug);
}
