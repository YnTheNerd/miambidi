/**
 * Blog Seeding Utility for MiamBidi
 * Creates sample blog articles for testing and demonstration
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { BLOG_STATUS, BLOG_VISIBILITY, BLOG_TEMPLATES, BLOG_COLLECTIONS } from '../types/blog';

// Sample blog data for Cameroonian cuisine
const SAMPLE_BLOGS = [
  {
    title: "Les Secrets du Ndolé Authentique",
    excerpt: "Découvrez les techniques traditionnelles pour préparer le plat national du Cameroun avec des ingrédients authentiques et des astuces de grand-mère.",
    template: BLOG_TEMPLATES.TEMPLATE_A,
    content: {
      heroImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
      mainText: `Le Ndolé est bien plus qu'un simple plat - c'est l'âme de la cuisine camerounaise. Cette recette ancestrale, transmise de génération en génération, nécessite patience et savoir-faire.

**Ingrédients essentiels :**
- Feuilles de ndolé fraîches (ou séchées)
- Arachides crues décortiquées
- Poisson fumé (machoiron ou chinchard)
- Crevettes séchées
- Viande de bœuf
- Huile de palme rouge
- Épices traditionnelles

**La technique secrète :**
Le secret réside dans la préparation des arachides. Elles doivent être grillées légèrement avant d'être pilées pour libérer tous leurs arômes. Les feuilles de ndolé, quant à elles, doivent être soigneusement nettoyées et hachées finement.

**Conseils de grand-mère :**
- Toujours commencer par faire revenir les oignons dans l'huile de palme
- Ajouter les épices une par une pour développer les saveurs
- Laisser mijoter à feu doux pendant au moins 2 heures
- Goûter et ajuster l'assaisonnement en fin de cuisson

Ce plat se marie parfaitement avec du plantain bouilli ou du riz blanc. Un vrai délice qui réunit toute la famille autour de la table !`
    },
    tags: ["ndolé", "plat-national", "cuisine-traditionnelle", "cameroun", "recette-authentique"],
    category: "Plats Principaux",
    status: BLOG_STATUS.PUBLISHED,
    visibility: BLOG_VISIBILITY.PUBLIC,
    estimatedReadTime: 8
  },
  {
    title: "Maîtriser l'Art du Poulet DG",
    excerpt: "Le Poulet Directeur Général, symbole de convivialité camerounaise. Apprenez à préparer ce plat festif avec ses légumes colorés et ses saveurs uniques.",
    template: BLOG_TEMPLATES.TEMPLATE_B,
    content: {
      images: [
        "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop"
      ],
      textBlocks: [
        `Le Poulet DG (Directeur Général) est né dans les années 80 dans les restaurants chics de Douala. Ce plat, symbole de réussite sociale, est devenu incontournable lors des grandes occasions.

**Pourquoi "Directeur Général" ?**
Ce nom prestigieux vient du fait que ce plat était initialement servi dans les restaurants huppés, fréquentés par les cadres supérieurs et dirigeants d'entreprise.

**Les ingrédients de luxe :**
- Poulet fermier découpé en morceaux
- Plantains mûrs
- Carottes en julienne
- Haricots verts
- Poivrons multicolores
- Champignons de Paris`,

        `**La technique de cuisson parfaite :**

1. **Préparation du poulet :** Mariner les morceaux avec du gingembre, ail, curry et bouillon cube pendant 30 minutes minimum.

2. **Cuisson des légumes :** Faire revenir séparément chaque légume pour préserver leur couleur et leur croquant.

3. **Assemblage final :** Réunir tous les éléments dans une grande poêle avec un peu de bouillon pour lier les saveurs.

**Astuce du chef :** Le secret réside dans la cuisson séparée de chaque ingrédient avant l'assemblage final. Cela permet de conserver les textures et les couleurs vives qui font la beauté de ce plat.

Servez avec du riz parfumé ou des pommes de terre sautées pour un repas digne des plus grandes tables !`
      ]
    },
    tags: ["poulet-dg", "plat-festif", "cuisine-moderne", "légumes", "convivialité"],
    category: "Plats Festifs",
    status: BLOG_STATUS.PUBLISHED,
    visibility: BLOG_VISIBILITY.PREMIUM,
    estimatedReadTime: 12
  },
  {
    title: "Guide Complet des Épices Camerounaises",
    excerpt: "Explorez l'univers fascinant des épices et condiments traditionnels du Cameroun. Un voyage sensoriel à travers les saveurs authentiques de notre terroir.",
    template: BLOG_TEMPLATES.TEMPLATE_C,
    content: {
      images: [
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
      ],
      mainText: `Les épices sont l'âme de la cuisine camerounaise. Chaque région a ses spécialités, ses mélanges secrets transmis de mère en fille.

**Les incontournables du garde-manger camerounais :**

**Poivre de Penja :** Considéré comme l'un des meilleurs poivres au monde, il apporte une note florale unique à vos plats.

**Gingembre frais :** Indispensable pour mariner viandes et poissons, il apporte fraîcheur et piquant.

**Ail et échalotes :** La base aromatique de nombreuses préparations traditionnelles.

**Curry en poudre :** Héritage de l'influence indienne, il parfume délicatement les ragoûts.

**Bouillon cube :** L'allié moderne qui rehausse toutes les préparations.

**Piment rouge séché :** Pour ceux qui aiment les sensations fortes !

**Comment bien les conserver :**
- Épices entières dans des bocaux hermétiques
- Éviter l'exposition à la lumière directe
- Renouveler régulièrement pour préserver les arômes
- Moudre au dernier moment pour plus d'intensité

**Mélanges traditionnels :**
Chaque famille a ses proportions secrètes. L'art consiste à équilibrer les saveurs selon les goûts de chacun et le plat préparé.

Ces épices transforment les ingrédients les plus simples en véritables festins. Elles sont le pont entre tradition et modernité dans nos cuisines d'aujourd'hui.`
    },
    tags: ["épices", "condiments", "tradition", "saveurs", "guide-pratique"],
    category: "Guides Pratiques",
    status: BLOG_STATUS.PUBLISHED,
    visibility: BLOG_VISIBILITY.PUBLIC,
    estimatedReadTime: 10
  },
  {
    title: "Brouillon : Innovations en Cuisine Camerounaise",
    excerpt: "Exploration des nouvelles tendances culinaires qui modernisent nos plats traditionnels tout en respectant leur authenticité.",
    template: BLOG_TEMPLATES.TEMPLATE_A,
    content: {
      heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      mainText: `[Article en cours de rédaction]

La cuisine camerounaise évolue avec son temps. De jeunes chefs revisitent nos classiques avec créativité...

**Tendances émergentes :**
- Fusion afro-européenne
- Techniques de cuisson modernes
- Présentation gastronomique
- Ingrédients bio et locaux

[À développer...]`
    },
    tags: ["innovation", "cuisine-moderne", "fusion", "tendances"],
    category: "Tendances",
    status: BLOG_STATUS.DRAFT,
    visibility: BLOG_VISIBILITY.PUBLIC,
    estimatedReadTime: 5
  },
  {
    title: "Les Desserts Oubliés du Cameroun",
    excerpt: "Redécouvrez les douceurs traditionnelles camerounaises qui ont marqué l'enfance de nos grands-parents et méritent d'être préservées.",
    template: BLOG_TEMPLATES.TEMPLATE_B,
    content: {
      images: [
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop"
      ],
      textBlocks: [
        `Nos grands-mères savaient transformer les fruits tropicaux en délicieux desserts avec des moyens simples mais efficaces.

**Les classiques d'antan :**
- Beignets de banane plantain
- Confiture de goyave maison
- Bouillie de maïs sucrée
- Gâteau à la noix de coco râpée
- Beignets de patate douce

Ces recettes simples mais savoureuses utilisaient uniquement des ingrédients locaux et de saison.`,

        `**Techniques traditionnelles :**

La cuisson se faisait souvent au feu de bois, donnant une saveur fumée particulière. Les fruits étaient cueillis à maturité parfaite dans les jardins familiaux.

**Moderniser sans dénaturer :**
Aujourd'hui, nous pouvons adapter ces recettes avec des techniques modernes tout en préservant leur essence authentique.

Ces desserts méritent de retrouver leur place sur nos tables pour transmettre notre patrimoine culinaire aux nouvelles générations.`
      ]
    },
    tags: ["desserts", "tradition", "patrimoine", "fruits-tropicaux", "nostalgie"],
    category: "Desserts",
    status: BLOG_STATUS.PUBLISHED,
    visibility: BLOG_VISIBILITY.PREMIUM,
    estimatedReadTime: 7
  }
];

/**
 * Seed blog articles for testing
 * @param {string} authorId - User ID to assign as author
 * @param {string} familyId - Optional family ID for family blogs
 * @returns {Promise<Array>} Array of created blog IDs
 */
export const seedBlogArticles = async (authorId, familyId = null) => {
  const createdBlogs = [];
  
  try {
    console.log('🌱 Starting blog seeding process...');
    
    for (const blogData of SAMPLE_BLOGS) {
      const blogDoc = {
        ...blogData,
        authorId,
        authorName: "Chef MiamBidi", // Default author name
        authorAvatar: null,
        familyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: blogData.status === BLOG_STATUS.PUBLISHED ? serverTimestamp() : null,
        views: Math.floor(Math.random() * 100), // Random view count for demo
        likes: [], // Empty likes array
        slug: generateSlug(blogData.title)
      };
      
      const docRef = await addDoc(collection(db, BLOG_COLLECTIONS.blogs), blogDoc);
      createdBlogs.push({
        id: docRef.id,
        title: blogData.title,
        status: blogData.status
      });
      
      console.log(`✅ Created blog: ${blogData.title} (${docRef.id})`);
    }
    
    console.log(`🎉 Successfully seeded ${createdBlogs.length} blog articles!`);
    return createdBlogs;
    
  } catch (error) {
    console.error('❌ Error seeding blog articles:', error);
    throw error;
  }
};

/**
 * Clean up seeded blog articles
 * @param {string} authorId - Author ID to filter by
 * @returns {Promise<number>} Number of deleted articles
 */
export const cleanupSeededBlogs = async (authorId) => {
  try {
    console.log('🧹 Starting blog cleanup process...');
    
    const q = query(
      collection(db, BLOG_COLLECTIONS.blogs),
      where('authorId', '==', authorId)
    );
    
    const querySnapshot = await getDocs(q);
    let deletedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const blogData = docSnapshot.data();
      
      // Only delete blogs that match our seeded titles
      const isSeedBlog = SAMPLE_BLOGS.some(sample => 
        sample.title === blogData.title
      );
      
      if (isSeedBlog) {
        await deleteDoc(doc(db, BLOG_COLLECTIONS.blogs, docSnapshot.id));
        console.log(`🗑️ Deleted: ${blogData.title}`);
        deletedCount++;
      }
    }
    
    console.log(`✅ Cleanup completed. Deleted ${deletedCount} seeded articles.`);
    return deletedCount;
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
};

/**
 * Generate URL-friendly slug from title
 * @param {string} title - Blog title
 * @returns {string} URL slug
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

/**
 * Check if blogs are already seeded for a user
 * @param {string} authorId - Author ID to check
 * @returns {Promise<boolean>} True if blogs exist
 */
export const checkIfBlogsSeeded = async (authorId) => {
  try {
    const q = query(
      collection(db, BLOG_COLLECTIONS.blogs),
      where('authorId', '==', authorId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
    
  } catch (error) {
    console.error('Error checking seeded blogs:', error);
    return false;
  }
};

export default {
  seedBlogArticles,
  cleanupSeededBlogs,
  checkIfBlogsSeeded,
  SAMPLE_BLOGS
};
