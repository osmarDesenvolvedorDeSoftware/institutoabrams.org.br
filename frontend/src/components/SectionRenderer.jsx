export function SectionRenderer({ sections }) {
  if (!sections) return null;

  return sections.map((section, index) => {
    if (section.type === 'text') {
      return <p key={index}>{section.content}</p>;
    }

    if (section.type === 'image') {
      return <img key={index} src={section.url} alt={section.alt || ''} />;
    }

    // fallback para tipos desconhecidos
    return null;
  });
}
