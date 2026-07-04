export const SITE = {
  name: 'México in Tech',
  tagline: 'Comunidades tech en México',
  domain: 'https://mxintech.org',
  location: 'Tlaxcala, México',
  description:
    'México in Tech es una comunidad tech en México. Somos el AWS User Group Tlaxcala: webinars, eventos y cursos para desarrolladores.',
  keywords: [
    'comunidades tech',
    'mexico in tech',
    'méxico in tech',
    'aws user group tlaxcala',
    'comunidad tech méxico',
    'aws user group',
    'webinars tech',
    'desarrolladores méxico',
  ].join(', '),
};

export const PAGE_META = {
  '/': {
    title: 'México in Tech | Comunidades Tech | AWS User Group Tlaxcala',
    description:
      'Únete a México in Tech, una de las comunidades tech más activas de México. AWS User Group Tlaxcala con webinars, eventos y networking para desarrolladores.',
  },
  '/cursos': {
    title: 'Cursos | México in Tech — Comunidades Tech',
    description:
      'Cursos de AWS, Linux y tecnología cloud en México in Tech. Aprende con la comunidad tech del AWS User Group Tlaxcala.',
  },
  '/contact/member': {
    title: 'Únete como miembro | México in Tech',
    description:
      'Regístrate en México in Tech para aprender, crecer profesionalmente y enterarte de eventos, cursos y webinars del AWS User Group Tlaxcala.',
  },
  '/contact/leader': {
    title: 'Sé un líder | México in Tech',
    description:
      'Contribuye activamente a México in Tech: organiza eventos, genera contenido, difunde la comunidad y ayuda a hacerla crecer.',
  },
  '/lideres/estandares': {
    title: 'Estándares de Líderes | México in Tech',
    description:
      'Lo que la comunidad espera de sus líderes: respeto, compromiso, representación honesta y participación activa en México in Tech.',
  },
  '/contact/speaker': {
    title: 'Sé un speaker | México in Tech',
    description:
      'Comparte tu experiencia técnica en charlas y webinars de México in Tech. Propón el tema que te gustaría presentar a la comunidad.',
  },
  '/contact/business': {
    title: 'Empresas y colaboraciones | México in Tech',
    description:
      'Patrocina o colabora con México in Tech: sedes, swag, cursos, eventos e invitaciones para impulsar la comunidad tech en México.',
  },
};

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  alternateName: ['Mexico in Tech', 'MXINTECH', 'AWS User Group Tlaxcala'],
  url: SITE.domain,
  description: SITE.description,
  areaServed: {
    '@type': 'Country',
    name: 'México',
  },
  location: {
    '@type': 'Place',
    name: SITE.location,
  },
  sameAs: [
    'https://www.facebook.com/mxintech/',
    'https://www.linkedin.com/company/mxintech/',
    'https://www.youtube.com/mexicointech',
    'https://x.com/mxintech',
    'https://www.meetup.com/aws-user-group-tlaxcala/',
  ],
};
