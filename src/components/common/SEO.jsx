import { Helmet } from 'react-helmet-async';

const SITE = 'Arrivio';
const BASE_URL = 'https://arrivio.de';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;
const DEFAULT_DESC = 'Find furnished, move-in ready apartments in Germany. All-inclusive rent, no deposits, designed for international students and professionals.';

const SEO = ({ title, description = DEFAULT_DESC, image = DEFAULT_IMAGE, path = '', type = 'website' }) => {
    const pageTitle = title ? `${title} — ${SITE}` : `${SITE} — Move-in Ready Housing for Internationals`;
    const url = `${BASE_URL}${path}`;

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={SITE} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
