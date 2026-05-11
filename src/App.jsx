import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Brain, Clock, Play, ChevronRight, RotateCcw, CheckCircle2,
  XCircle, Trophy, AlertCircle, BookOpen, Sparkles, Target,
  TrendingUp, Eye, EyeOff, Pause, Award, BarChart3, Zap,
  Flame, Keyboard, Settings2, Sun, Moon, Upload, FileText, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import Papa from 'papaparse';

// ============================================================
// 75 QUESTIONS EMBARQUÉES (15 par domaine × 5 domaines)
// Tu peux importer les 5 CSV pour atteindre 250 questions
// ============================================================
const DEFAULT_QUESTIONS = [
  // D1 — Fondamentaux IA/ML
  {i:'D1-001',d:1,df:'e',q:"Relation entre IA, Machine Learning et Deep Learning ?",o:["Le ML englobe l'IA et le DL","IA et ML équivalents au DL","Le DL est un sous-ensemble du ML, lui-même sous-ensemble de l'IA","Trois domaines indépendants"],a:2,e:"Hiérarchie : IA ⊃ ML ⊃ DL. Le DL utilise des réseaux de neurones profonds.",s:"-"},
  {i:'D1-002',d:1,df:'e',q:"Banque avec emails étiquetés spam/légitime → classifieur. Quel apprentissage ?",o:["Supervisé (données étiquetées)","Non supervisé","Renforcement","Auto-encodage"],a:0,e:"Apprentissage supervisé = exemples étiquetés (entrée → sortie connue).",s:"Amazon SageMaker"},
  {i:'D1-003',d:1,df:'e',q:"Regrouper 1M de clients en segments similaires, sans catégories préalables.",o:["Renforcement","Clustering (non supervisé)","Supervisé","Régression"],a:1,e:"Clustering = apprentissage non supervisé, groupe sans étiquettes.",s:"Amazon SageMaker"},
  {i:'D1-004',d:1,df:'e',q:"Prédire le prix exact d'une maison à partir de caractéristiques.",o:["Classification binaire","Clustering","Régression","Détection d'anomalies"],a:2,e:"Régression = prédire une valeur numérique continue.",s:"Amazon SageMaker"},
  {i:'D1-005',d:1,df:'e',q:"Analyser images/vidéos (objets, visages, modération) sans entraîner de modèle.",o:["Amazon Rekognition","Amazon Polly","Amazon Transcribe","Amazon Macie"],a:0,e:"Rekognition = analyse d'images/vidéos avec modèles pré-entraînés.",s:"Amazon Rekognition"},
  {i:'D1-006',d:1,df:'e',q:"Analyser le sentiment de milliers d'avis clients en plusieurs langues.",o:["Amazon Translate","Amazon Polly","Amazon Lex","Amazon Comprehend"],a:3,e:"Comprehend = service NLP managé : sentiment, entités, sujets, classification.",s:"Amazon Comprehend"},
  {i:'D1-007',d:1,df:'e',q:"Extraire texte, tableaux et formulaires de documents scannés.",o:["Amazon Comprehend","Amazon Translate","Amazon Textract","Amazon Rekognition"],a:2,e:"Textract va au-delà de l'OCR : structure (tableaux, formulaires).",s:"Amazon Textract"},
  {i:'D1-008',d:1,df:'e',q:"Convertir texte en parole naturelle (TTS) avec voix neuronales.",o:["Amazon Transcribe","Amazon Polly","Amazon Lex","Amazon Comprehend"],a:1,e:"Polly = Text-to-Speech. Transcribe fait l'inverse (STT).",s:"Amazon Polly"},
  {i:'D1-009',d:1,df:'e',q:"Plateforme ML managée end-to-end pour modèles personnalisés.",o:["Amazon Bedrock","AWS Glue","Amazon SageMaker","Amazon EMR"],a:2,e:"SageMaker = cycle ML complet : préparation, entraînement, déploiement, monitoring.",s:"Amazon SageMaker"},
  {i:'D1-010',d:1,df:'m',q:"Différence principale entre SageMaker et Bedrock ?",o:["Bedrock est l'ancienne version","SageMaker construit/entraîne des modèles custom, Bedrock donne accès à des FMs pré-entraînés via API","Mêmes services","SageMaker pour l'image, Bedrock pour le texte"],a:1,e:"SageMaker = ML custom. Bedrock = FMs managés via API.",s:"SageMaker / Bedrock"},
  {i:'D1-011',d:1,df:'m',q:"Modèle à 99% sur entraînement et 60% sur test. Phénomène ?",o:["Underfitting","Data leak","Overfitting","Convergence parfaite"],a:2,e:"Overfitting : le modèle mémorise le bruit. Remèdes : régularisation, plus de données.",s:"Amazon SageMaker"},
  {i:'D1-012',d:1,df:'m',q:"Pour détection de cancer (priorité : ne manquer aucun cas positif), métrique ?",o:["Precision","Recall (rappel)","Specificity","Latency"],a:1,e:"Recall = TP/(TP+FN) : minimise les faux négatifs, critique en médecine.",s:"Amazon SageMaker"},
  {i:'D1-013',d:1,df:'m',q:"Prédictions à très faible latence en temps réel via API HTTPS.",o:["Batch Transform","Async inference","Notebook seul","Real-time inference endpoint"],a:3,e:"Real-time endpoint = API persistante avec autoscaling.",s:"Amazon SageMaker"},
  {i:'D1-014',d:1,df:'m',q:"Détecter dérive (data drift, model drift) des modèles en production.",o:["SageMaker Pipelines","CloudTrail","JumpStart","SageMaker Model Monitor"],a:3,e:"Model Monitor surveille les endpoints et alerte en cas de dérive.",s:"SageMaker Model Monitor"},
  {i:'D1-015',d:1,df:'m',q:"Étiqueter des données via workforce humain et auto-labeling.",o:["SageMaker Studio","Amazon Comprehend","Amazon Bedrock","SageMaker Ground Truth"],a:3,e:"Ground Truth aide à créer des datasets étiquetés pour le supervised learning.",s:"SageMaker Ground Truth"},

  // D2 — Fondamentaux IA générative
  {i:'D2-001',d:2,df:'e',q:"Qu'est-ce qu'un foundation model ?",o:["Modèle entraîné sur un seul domaine","Modèle de grande taille pré-entraîné sur vaste corpus, adaptable à de nombreuses tâches","Réservé au matériel quantique","Bibliothèque pour chercheurs"],a:1,e:"FMs (GPT, Claude, Llama, Titan, Nova) pré-entraînés puis adaptés.",s:"Amazon Bedrock"},
  {i:'D2-002',d:2,df:'e',q:"Que signifie LLM ?",o:["Long Latency Model","Light Language Model","Linear Learning Machine","Large Language Model"],a:3,e:"LLM = Large Language Model. Plusieurs milliards de paramètres.",s:"Amazon Bedrock"},
  {i:'D2-003',d:2,df:'e',q:"Unité de base manipulée par un LLM pour le texte ?",o:["Le token (mot ou sous-mot)","Le bit","Le pixel","La page"],a:0,e:"Tokenizer découpe le texte en tokens. Facturation au token.",s:"Amazon Bedrock"},
  {i:'D2-004',d:2,df:'m',q:"Un embedding représente :",o:["Format de stockage des poids","Fonction de coût","Représentation vectorielle numérique capturant la sémantique","Type d'optimiseur"],a:2,e:"Embeddings = vecteurs denses placés selon similarité sémantique.",s:"Titan Embeddings"},
  {i:'D2-005',d:2,df:'e',q:"Paramètre contrôlant l'aléa/créativité des réponses LLM ?",o:["max_tokens","batch_size","stop_sequences","temperature"],a:3,e:"Temperature proche de 0 = déterministe ; proche de 1 = créatif.",s:"Amazon Bedrock"},
  {i:'D2-006',d:2,df:'m',q:"Le paramètre top_p (nucleus sampling) :",o:["Définit le nb de tokens de sortie","Choisit la version du modèle","Limite l'échantillonnage aux tokens dont la probabilité cumulée atteint p","Active le streaming"],a:2,e:"top_p=0.9 : garde les tokens cumulant 90% de probabilité.",s:"Amazon Bedrock"},
  {i:'D2-007',d:2,df:'m',q:"Context window d'un LLM désigne :",o:["Interface graphique","Temps maximal de réponse","Nombre maximal de tokens (input+output) traitables en une requête","Taille du modèle en GB"],a:2,e:"De qq milliers à plusieurs millions de tokens selon les modèles.",s:"Amazon Bedrock"},
  {i:'D2-008',d:2,df:'e',q:"LLM répond une info factuellement fausse avec assurance. Phénomène ?",o:["Overfitting","Hallucination","Token leakage","Bias drift"],a:1,e:"Hallucinations = limite majeure des LLMs. Mitigation : RAG, Guardrails.",s:"Bedrock Guardrails"},
  {i:'D2-009',d:2,df:'e',q:"Question sans aucun exemple = approche...",o:["Chain-of-thought","Few-shot","Reinforcement","Zero-shot"],a:3,e:"Zero-shot = aucun exemple. Few-shot = quelques exemples.",s:"Amazon Bedrock"},
  {i:'D2-010',d:2,df:'e',q:"Inclure 3-10 exemples dans le prompt =",o:["Fine-tuning","Pre-training","Few-shot prompting (in-context learning)","RAG"],a:2,e:"Few-shot guide le modèle sur format/style attendu sans réentraîner.",s:"Amazon Bedrock"},
  {i:'D2-011',d:2,df:'m',q:"Expliciter le raisonnement étape par étape =",o:["Token streaming","Output filtering","Continuous pretraining","Chain-of-thought (CoT)"],a:3,e:"CoT améliore drastiquement les tâches de raisonnement.",s:"Amazon Bedrock"},
  {i:'D2-012',d:2,df:'m',q:"Modèle multimodal peut :",o:["Uniquement du texte","Traiter plusieurs types : texte + image + audio/vidéo","Uniquement plusieurs langues","Tourner sur matériel spécifique"],a:1,e:"Multimodaux : Claude 3 vision, Nova, GPT-4o, Gemini.",s:"Amazon Bedrock"},
  {i:'D2-013',d:2,df:'m',q:"Technologie sous Titan Image Generator / Stable Diffusion ?",o:["Arbres de décision","ARIMA","K-Means","Modèles de diffusion (débruitage itératif d'un bruit)"],a:3,e:"Diffusion models : débruitage progressif guidé par le prompt.",s:"Amazon Bedrock"},
  {i:'D2-014',d:2,df:'m',q:"Famille Amazon Titan inclut :",o:["Uniquement vidéo","Modèles texte, image et embeddings AWS","Uniquement open source","Une seule taille"],a:1,e:"Titan : Titan Text, Titan Embeddings, Titan Image Generator.",s:"Amazon Titan"},
  {i:'D2-015',d:2,df:'m',q:"Comment combler le knowledge cutoff d'un FM ?",o:["Réentraîner chaque jour","Accepter qu'il ne soit jamais à jour","Désactiver","RAG ou agent capable d'appeler des outils/APIs externes"],a:3,e:"RAG et agents = approches standards pour info à jour.",s:"Bedrock Knowledge Bases"},

  // D3 — Applications des FMs
  {i:'D3-001',d:3,df:'e',q:"Proposition de valeur d'Amazon Bedrock ?",o:["Stocker des bases vectorielles","Accès via API unique à plusieurs FMs sans gérer d'infra","Remplacer SageMaker","Uniquement Titan"],a:1,e:"Bedrock = serverless, plusieurs FMs (Anthropic, Meta, Mistral, AI21, Cohere, Amazon, Stability) via API REST.",s:"Amazon Bedrock"},
  {i:'D3-002',d:3,df:'m',q:"Modèles de tarification Bedrock :",o:["On-demand (au token) + Provisioned Throughput + Batch inference","Uniquement gratuit","Uniquement annuel","Uniquement spot"],a:0,e:"On-demand variable, Provisioned constant, Batch en différé (-50%).",s:"Amazon Bedrock"},
  {i:'D3-003',d:3,df:'m',q:"Le RAG consiste à :",o:["Réentraîner quotidiennement","Désactiver les paramètres","Récupérer du contexte pertinent et l'injecter dans le prompt avant la génération","Compresser le modèle"],a:2,e:"RAG ancre le LLM sur des sources externes sans réentraîner.",s:"Bedrock Knowledge Bases"},
  {i:'D3-004',d:3,df:'m',q:"Le RAG est PARTICULIÈREMENT adapté quand :",o:["On veut modifier le style","Connaissances changent souvent, confidentielles, ou volumineuses","Réduire les hallucinations en ancrant sur des sources","B et C"],a:3,e:"RAG résout : fraîcheur, confidentialité, ancrage anti-hallucination.",s:"Bedrock Knowledge Bases"},
  {i:'D3-005',d:3,df:'m',q:"Le fine-tuning d'un FM est JUSTIFIÉ pour :",o:["Adapter style/ton/format avec un dataset étiqueté représentatif","Apprendre des faits qui changent","Éviter un FM","Réduire la gestion"],a:0,e:"Fine-tuning = spécialiser sur style/format. Connaissance évolutive → préférer RAG.",s:"Amazon Bedrock"},
  {i:'D3-006',d:3,df:'m',q:"Hiérarchie de personnalisation FM (moins au plus coûteux) :",o:["Prompt eng → RAG → Fine-tuning → Continued pretraining → From scratch","From scratch → Fine-tuning → RAG → Prompt","Toujours fine-tuning","Toujours from scratch"],a:0,e:"Règle d'or AWS : commencer par la solution la plus simple.",s:"Amazon Bedrock"},
  {i:'D3-007',d:3,df:'e',q:"Bedrock Knowledge Bases permet :",o:["IAM","Pipeline RAG managé : ingestion, chunking, embeddings, stockage, recherche","Stocker des modèles fine-tunés","Remplacer S3"],a:1,e:"Knowledge Bases automatise toute la chaîne RAG.",s:"Bedrock Knowledge Bases"},
  {i:'D3-008',d:3,df:'m',q:"Vector stores supportés par Bedrock Knowledge Bases :",o:["Uniquement DynamoDB","Uniquement S3","Aucune option","OpenSearch Serverless, Aurora (pgvector), Pinecone, Redis, MongoDB Atlas, Neptune Analytics"],a:3,e:"Choix selon latence, coût, features (hybrid search).",s:"Bedrock Knowledge Bases"},
  {i:'D3-009',d:3,df:'e',q:"Rôle principal de Bedrock Agents ?",o:["Stocker embeddings","Gérer SSL","Orchestrer des actions multi-étapes : appeler outils/APIs via Lambda","Compresser"],a:2,e:"Agents : décomposition, appels d'outils, raisonnement multi-étapes.",s:"Bedrock Agents"},
  {i:'D3-010',d:3,df:'e',q:"Amazon Q Business est :",o:["Stockage","Assistant IA générative pour entreprises, connecté aux apps métier, respectant les ACL","Monitoring","DNS"],a:1,e:"Q Business hérite des permissions de chaque source connectée.",s:"Amazon Q Business"},
  {i:'D3-011',d:3,df:'e',q:"Amazon Q Developer aide les développeurs à :",o:["Marketing","Prévision","Facturation","Écrire/expliquer/déboguer du code, scanner les vulnérabilités, moderniser"],a:3,e:"Q Developer = ex-CodeWhisperer, intégré VS Code, JetBrains, console AWS.",s:"Amazon Q Developer"},
  {i:'D3-012',d:3,df:'m',q:"Pour des réponses FACTUELLES et déterministes (extraction structurée) :",o:["Temperature max","Temperature proche de 0 et top_p restrictif","Désactiver l'inférence","Doubler max_tokens"],a:1,e:"Tâches déterministes : T 0-0.2, top_p 0.1-0.5.",s:"Amazon Bedrock"},
  {i:'D3-013',d:3,df:'m',q:"Pour des réponses créatives (brainstorming, slogans) :",o:["Temperature 0.8 + top_p permissif","Temperature à 0","Désactiver tous les paramètres","max_tokens à 1"],a:0,e:"Temperature élevée (0.7-1) + top_p élevé maximisent la diversité.",s:"Amazon Bedrock"},
  {i:'D3-014',d:3,df:'m',q:"Tool use (function calling) permet :",o:["Au modèle d'appeler une fonction/API externe avec arguments structurés","Désactiver le modèle","Compresser","Lire le billing"],a:0,e:"Tool use rend les LLMs actionnables (calculatrice, DB, API).",s:"Amazon Bedrock"},
  {i:'D3-015',d:3,df:'m',q:"Approche recommandée pour développer une app gen AI :",o:["Tout fine-tuner","From scratch","Itérer : prompt eng → RAG si besoin → fine-tuning si style spécifique","Que des modèles propriétaires"],a:2,e:"Approche incrémentale : évaluer à chaque étape, complexifier si nécessaire.",s:"Amazon Bedrock"},

  // D4 — IA responsable
  {i:'D4-001',d:4,df:'m',q:"Dimensions de l'IA responsable selon AWS :",o:["Fairness, Explainability, Privacy & Security, Safety, Controllability, Veracity, Governance, Transparency","Coût et performance uniquement","Vitesse","Aucune dimension"],a:0,e:"AWS publie 8 dimensions de l'IA responsable.",s:"AWS Responsible AI"},
  {i:'D4-002',d:4,df:'e',q:"La fairness en IA signifie :",o:["Modèle gratuit","Traite équitablement les groupes sans discriminer injustement","Rapide","Open source"],a:1,e:"Fairness = éviter qu'un modèle pénalise certains groupes sans raison.",s:"SageMaker Clarify"},
  {i:'D4-003',d:4,df:'e',q:"SageMaker Clarify aide à :",o:["Compresser","Déployer","Détecter biais (pré/post entraînement), expliquer prédictions (SHAP), monitorer biais en prod","IAM"],a:2,e:"Clarify : fairness, explicability (SHAP). Référence AWS XAI.",s:"SageMaker Clarify"},
  {i:'D4-004',d:4,df:'m',q:"Valeurs SHAP permettent :",o:["Compresser","IAM","Sauvegarde","Score d'importance de chaque feature dans une prédiction, basé sur la théorie des jeux"],a:3,e:"SHAP = référence pour l'explicabilité. Intégré dans SageMaker Clarify.",s:"SageMaker Clarify"},
  {i:'D4-005',d:4,df:'m',q:"SageMaker Model Cards permettent :",o:["Documenter les modèles (usage prévu, dataset, métriques, limitations, éthique) pour transparence et gouvernance","Stocker images","Déployer","Compresser"],a:0,e:"Model Cards = fiches de gouvernance essentielles pour AI Act, audits.",s:"SageMaker Model Cards"},
  {i:'D4-006',d:4,df:'m',q:"AWS AI Service Cards sont :",o:["Cartes physiques","Fiches de paie","Cartes de crédit","Fiches publiques AWS documentant usage, perfs, limites et considérations responsables des services AI"],a:3,e:"Disponibles pour Rekognition Face Matching, Textract AnalyzeID, etc.",s:"AWS AI Service Cards"},
  {i:'D4-007',d:4,df:'e',q:"Bedrock Guardrails fournit :",o:["Couche centralisée de safety : content filters, denied topics, word filters, PII, contextual grounding","Backup","DNS","CDN"],a:0,e:"Guardrails applicable à plusieurs FMs via API ApplyGuardrail.",s:"Bedrock Guardrails"},
  {i:'D4-008',d:4,df:'m',q:"Content filters de Bedrock Guardrails couvrent :",o:["Orthographe","Aucune catégorie","Hate, Insults, Sexual, Violence, Misconduct, Prompt attacks (niveaux low/medium/high)","Grammaire"],a:2,e:"6 catégories avec niveaux réglables sur prompt et response.",s:"Bedrock Guardrails"},
  {i:'D4-009',d:4,df:'m',q:"Sensitive information filter de Guardrails :",o:["Augmente le coût","Désactive","Détecte/masque les PII (cartes, SSN, emails, IP) + regex personnalisés","Compresse"],a:2,e:"Protège contre la divulgation accidentelle de données personnelles.",s:"Bedrock Guardrails"},
  {i:'D4-010',d:4,df:'m',q:"Contextual grounding check de Guardrails :",o:["Vérifie que la réponse est ancrée dans le contexte fourni (RAG) et pertinente, pour réduire les hallucinations","Orthographe","JSON","Coût"],a:0,e:"Contextual grounding : grounding (ancrage) + relevance (pertinence).",s:"Bedrock Guardrails"},
  {i:'D4-011',d:4,df:'m',q:"Stratégies pour réduire les hallucinations :",o:["Temperature au max","Ignorer","Aucune","RAG + contextual grounding + citations + validation humaine + prompts contraints"],a:3,e:"Approche en couches : grounding + validation + monitoring.",s:"Bedrock Guardrails"},
  {i:'D4-012',d:4,df:'m',q:"Amazon Augmented AI (A2I) :",o:["Compresse","Workflow de revue humaine pour prédictions à faible confiance ou cas sensibles","Latence","IAM"],a:1,e:"A2I = HITL automatisé avec routage selon règles.",s:"Amazon A2I"},
  {i:'D4-013',d:4,df:'m',q:"HITL (human-in-the-loop) particulièrement pertinent pour :",o:["Tâches triviales","Aucun cas","Économies en supprimant les humains","Décisions à fort impact (médical, juridique, RH, prêt) ou prédictions à faible confiance"],a:3,e:"HITL combine rapidité IA + discernement humain pour cas critiques.",s:"Amazon A2I"},
  {i:'D4-014',d:4,df:'e',q:"Le droit à l'explication (RGPD) signifie :",o:["Droit d'obtenir une explication compréhensible d'une décision automatisée significative","Droit de ne pas être expliqué","Droit de désactiver","Droit au remboursement"],a:0,e:"Article 22 RGPD. Outils XAI (SHAP, LIME) aident à respecter ce droit.",s:"AWS Responsible AI"},
  {i:'D4-015',d:4,df:'e',q:"L'IA responsable est :",o:["Voyage continu : évaluation, monitoring, audits, formations, gouvernance évolutive","Case à cocher","Contrainte","Sujet technique"],a:0,e:"L'IA responsable est une démarche continue intégrée au cycle de vie.",s:"AWS Responsible AI"},

  // D5 — Sécurité, conformité, gouvernance
  {i:'D5-001',d:5,df:'m',q:"Modèle de responsabilité partagée AWS appliqué à Bedrock :",o:["AWS gère l'infra et la sécurité de l'infra ; le client gère ses données, IAM, Guardrails","AWS gère tout","Le client gère l'infrastructure des modèles","Pas de modèle partagé"],a:0,e:"AWS = infra/runtime des modèles. Client = données/accès/configs.",s:"AWS Shared Responsibility"},
  {i:'D5-002',d:5,df:'m',q:"Autoriser un user à invoquer un FM précis sur Bedrock :",o:["Droits admin","Désactiver IAM","Policy IAM avec bedrock:InvokeModel limitée au modelArn","Partager les clés root"],a:2,e:"IAM permet scope par modelArn et conditions (tags, VPC source).",s:"AWS IAM"},
  {i:'D5-003',d:5,df:'e',q:"Principe du moindre privilège :",o:["Donner tous les droits","N'accorder que les permissions strictement nécessaires","Désactiver IAM","Stocker clés en clair"],a:1,e:"Least privilege = pilier du Well-Architected (Security).",s:"AWS IAM"},
  {i:'D5-004',d:5,df:'m',q:"VPC privé invoquant Bedrock SANS Internet :",o:["EC2 publique avec proxy","Désactiver le pare-feu","Direct Connect seul","VPC interface endpoint pour Bedrock (PrivateLink)"],a:3,e:"PrivateLink maintient le trafic sur le réseau AWS.",s:"AWS PrivateLink"},
  {i:'D5-005',d:5,df:'m',q:"Confidentialité des données client sur Bedrock :",o:["Prompts partagés avec d'autres clients","Publiés sur Marketplace","Prompts/personnalisation NE SONT PAS utilisés pour entraîner les FMs et NE SONT PAS partagés avec les fournisseurs","AWS utilise les données par défaut"],a:2,e:"Garantie clé de Bedrock : isolation des données client.",s:"Amazon Bedrock"},
  {i:'D5-006',d:5,df:'m',q:"Chiffrer les données Bedrock avec des clés client-managed :",o:["AWS KMS avec Customer Managed Keys (CMK)","AWS Shield","AWS WAF","Amazon Inspector"],a:0,e:"KMS CMK = contrôle accru (rotation, audit, accès).",s:"AWS KMS"},
  {i:'D5-007',d:5,df:'e',q:"Auditer qui a invoqué quel modèle sur Bedrock :",o:["AWS Shield","AWS Backup","AWS CloudTrail","Amazon CloudFront"],a:2,e:"CloudTrail = journalisation des appels API. Base de l'auditabilité.",s:"AWS CloudTrail"},
  {i:'D5-008',d:5,df:'m',q:"Pour journaliser prompts/complétions Bedrock dans S3/CloudWatch :",o:["Activer Bedrock model invocation logging","Désactiver le chiffrement","Augmenter temperature","Désactiver IAM"],a:0,e:"Invocation logging Bedrock = essentiel pour traçabilité et conformité.",s:"Amazon Bedrock"},
  {i:'D5-009',d:5,df:'e',q:"Amazon Macie permet de :",o:["Détecter automatiquement PII/secrets/données sensibles dans S3 via ML","Compresser des modèles","Augmenter temperature","Entraîner des FMs"],a:0,e:"Macie = découverte de données sensibles dans S3. Crucial avant fine-tuning.",s:"Amazon Macie"},
  {i:'D5-010',d:5,df:'m',q:"AWS Audit Manager aide à :",o:["Augmenter temperature","Désactiver KMS","Faire des sauvegardes","Automatiser la collecte de preuves de conformité (PCI DSS, HIPAA, RGPD, SOC 2, ISO 27001)"],a:3,e:"Audit Manager accélère la préparation d'audits.",s:"AWS Audit Manager"},
  {i:'D5-011',d:5,df:'m',q:"Frameworks de conformité applicables à un usage gen AI :",o:["Aucun","Uniquement RGPD","Uniquement HIPAA","RGPD, HIPAA, SOC 2, ISO 27001, FedRAMP, PCI DSS, AI Act selon le contexte"],a:3,e:"Le contexte détermine les frameworks applicables.",s:"AWS Compliance"},
  {i:'D5-012',d:5,df:'m',q:"Pour utiliser Bedrock avec des données HIPAA :",o:["Aucune précaution","Signer un BAA avec AWS + services HIPAA éligibles + config correcte (KMS, IAM, logs)","Désactiver KMS","Désactiver tout"],a:1,e:"BAA = prérequis légal. Bedrock est HIPAA-éligible depuis 2024.",s:"HIPAA et AWS"},
  {i:'D5-013',d:5,df:'m',q:"Garde-fous au niveau organisation (politiques centralisées multi-comptes) :",o:["Un seul compte gigantesque","AWS Organizations + Service Control Policies (SCPs)","Désactiver IAM","Partager les credentials root"],a:1,e:"SCPs définissent les permissions max possibles dans les comptes.",s:"AWS Organizations"},
  {i:'D5-014',d:5,df:'e',q:"Multi-Factor Authentication (MFA) :",o:["Augmente la latence","Désactive IAM","Désactive KMS","Renforce l'authentification avec un second facteur (token, app, hardware key)"],a:3,e:"MFA fortement recommandé pour tous IAM users, obligatoire pour root.",s:"AWS IAM"},
  {i:'D5-015',d:5,df:'m',q:"Architecture sécurisée type pour gen AI avec données sensibles :",o:["Aucune mesure","Compresser et oublier","Désactiver tout","IAM least privilege + VPC private + PrivateLink + KMS CMK + Guardrails + CloudTrail + Macie + Audit Manager"],a:3,e:"Défense en profondeur : couches multiples pour une sécurité robuste.",s:"AWS Well-Architected"},
];

// ============================================================
// CONFIG DOMAINES
// ============================================================
const DOMAINS = {
  1: { name: "Fondamentaux IA / ML", short: "D1", color: "#FF9900", weight: "20%" },
  2: { name: "Fondamentaux IA générative", short: "D2", color: "#22D3EE", weight: "24%" },
  3: { name: "Applications modèles de fondation", short: "D3", color: "#A78BFA", weight: "28%" },
  4: { name: "IA responsable", short: "D4", color: "#F472B6", weight: "14%" },
  5: { name: "Sécurité, conformité, gouvernance", short: "D5", color: "#4ADE80", weight: "14%" }
};

const LETTERS = ['A', 'B', 'C', 'D'];

// ============================================================
// FONTS
// ============================================================
const useGoogleFonts = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);
};

const FONT_SERIF = "'Instrument Serif', 'Times New Roman', serif";
const FONT_SANS = "'Geist', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  useGoogleFonts();

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [theme, setTheme] = useState('dark');
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('training');
  const [numQuestions, setNumQuestions] = useState(20);
  const [selectedDomains, setSelectedDomains] = useState([1, 2, 3, 4, 5]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(40);

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showImport, setShowImport] = useState(false);

  const isDark = theme === 'dark';
  const T = useMemo(() => isDark ? {
    bg1: '#0a0a0a', bg2: '#1a1a1a', card: 'rgba(20,20,20,0.6)', cardSolid: '#111',
    border: '#232323', borderH: '#3a3a3a', text: '#fafafa', textDim: '#a1a1aa',
    textMuted: '#71717a', accent: '#FF9900', accentH: '#ffad33', glassBg: 'rgba(255,255,255,0.02)'
  } : {
    bg1: '#fafafa', bg2: '#f0f0f0', card: 'rgba(255,255,255,0.7)', cardSolid: '#fff',
    border: '#e5e5e5', borderH: '#d4d4d4', text: '#0a0a0a', textDim: '#525252',
    textMuted: '#737373', accent: '#FF6600', accentH: '#ff8533', glassBg: 'rgba(0,0,0,0.02)'
  }, [isDark]);

  // Timer
  useEffect(() => {
    if (screen !== 'quiz' || !timerEnabled || isPaused || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); finishQuiz(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen, timerEnabled, isPaused, timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    if (screen !== 'quiz') return;
    const handler = (e) => {
      if (revealed) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNext(); }
        return;
      }
      if (['1','a','A'].includes(e.key)) setSelectedAnswer(0);
      else if (['2','b','B'].includes(e.key)) setSelectedAnswer(1);
      else if (['3','c','C'].includes(e.key)) setSelectedAnswer(2);
      else if (['4','d','D'].includes(e.key)) setSelectedAnswer(3);
      else if (e.key === 'Enter' && selectedAnswer !== null) { e.preventDefault(); submitAnswer(); }
      else if (e.key === ' ' && timerEnabled) { e.preventDefault(); setIsPaused(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, revealed, selectedAnswer, timerEnabled]);

  const startQuiz = () => {
    const pool = questions.filter(q => selectedDomains.includes(q.d));
    if (pool.length === 0) return;
    const n = Math.min(numQuestions, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, n);
    setQuiz(shuffled); setCurrentIdx(0); setAnswers({}); setSelectedAnswer(null);
    setRevealed(false); setTimeLeft(timerDuration * 60); setIsPaused(false);
    setStreak(0); setMaxStreak(0); setScreen('quiz');
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    const q = quiz[currentIdx];
    const correct = selectedAnswer === q.a;
    setAnswers(prev => ({ ...prev, [q.i]: selectedAnswer }));
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
    } else {
      setStreak(0);
    }
    if (mode === 'training') setRevealed(true);
    else goNext(correct);
  };

  const goNext = (skipFeedback = false) => {
    if (currentIdx + 1 >= quiz.length) finishQuiz();
    else { setCurrentIdx(currentIdx + 1); setSelectedAnswer(null); setRevealed(false); }
  };

  const finishQuiz = () => setScreen('results');

  const resetAll = () => {
    setScreen('home'); setQuiz(null); setCurrentIdx(0); setAnswers({});
    setSelectedAnswer(null); setRevealed(false); setStreak(0); setMaxStreak(0);
  };

  const toggleDomain = (d) => setSelectedDomains(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const handleCSVImport = (files) => {
    if (!files || files.length === 0) return;
    let imported = [];
    let processed = 0;
    Array.from(files).forEach(file => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          res.data.forEach(row => {
            if (row.id && row.question && row.option_a && row.correct_answer) {
              imported.push({
                i: row.id, d: parseInt(row.domain), df: row.difficulty?.[0] || 'm',
                q: row.question, o: [row.option_a, row.option_b, row.option_c, row.option_d],
                a: LETTERS.indexOf(row.correct_answer.trim().toUpperCase()),
                e: row.explanation || '', s: row.service || '-'
              });
            }
          });
          processed++;
          if (processed === files.length) {
            const existing = new Set(questions.map(q => q.i));
            const newOnes = imported.filter(q => !existing.has(q.i));
            setQuestions([...questions, ...newOnes]);
            setShowImport(false);
            alert(`✅ ${newOnes.length} questions importées ! Total : ${questions.length + newOnes.length}`);
          }
        }
      });
    });
  };

  const results = useMemo(() => {
    if (!quiz) return null;
    const total = quiz.length;
    let correct = 0;
    const byDomain = {};
    Object.keys(DOMAINS).forEach(d => byDomain[d] = { total: 0, correct: 0 });
    quiz.forEach(q => {
      byDomain[q.d].total++;
      if (answers[q.i] === q.a) { correct++; byDomain[q.d].correct++; }
    });
    const pct = total === 0 ? 0 : (correct / total) * 100;
    const awsScore = Math.round(100 + (pct / 100) * 900);
    return { total, correct, pct, awsScore, passed: awsScore >= 700, byDomain, maxStreak };
  }, [quiz, answers, maxStreak]);

  return (
    <div style={{
      minHeight: '100vh', background: T.bg1, color: T.text,
      fontFamily: FONT_SANS, position: 'relative', overflow: 'hidden'
    }}>
      <MeshGradientBg isDark={isDark} />
      <ThemeToggle theme={theme} setTheme={setTheme} T={T} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '920px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {screen === 'home' && (
          <HomeScreen
            T={T} isDark={isDark}
            mode={mode} setMode={setMode}
            numQuestions={numQuestions} setNumQuestions={setNumQuestions}
            selectedDomains={selectedDomains} toggleDomain={toggleDomain}
            timerEnabled={timerEnabled} setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration} setTimerDuration={setTimerDuration}
            startQuiz={startQuiz}
            questionsCount={questions.length}
            showImport={() => setShowImport(true)}
          />
        )}
        {screen === 'quiz' && quiz && (
          <QuizScreen
            T={T} isDark={isDark}
            quiz={quiz} currentIdx={currentIdx}
            selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer}
            revealed={revealed} mode={mode} answers={answers}
            timerEnabled={timerEnabled} timeLeft={timeLeft}
            isPaused={isPaused} setIsPaused={setIsPaused}
            submitAnswer={submitAnswer} goNext={goNext} finishQuiz={finishQuiz}
            streak={streak}
          />
        )}
        {screen === 'results' && results && (
          <ResultsScreen T={T} isDark={isDark} quiz={quiz} answers={answers} results={results} resetAll={resetAll} />
        )}
      </div>
      {showImport && <ImportModal T={T} isDark={isDark} onClose={() => setShowImport(false)} onImport={handleCSVImport} />}
    </div>
  );
}

// ============================================================
// ANIMATED MESH GRADIENT BACKGROUND
// ============================================================
function MeshGradientBg({ isDark }) {
  const colors = isDark
    ? ['rgba(255,153,0,0.12)', 'rgba(167,139,250,0.10)', 'rgba(34,211,238,0.08)']
    : ['rgba(255,153,0,0.15)', 'rgba(167,139,250,0.12)', 'rgba(34,211,238,0.10)'];
  return (
    <>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(80px,-50px) scale(1.1)} 66%{transform:translate(-40px,40px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,40px) scale(1.05)} 66%{transform:translate(50px,-30px) scale(1.15)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,60px) scale(1.1)} 66%{transform:translate(-50px,-50px) scale(0.9)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{transform:translateX(-12px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(74,222,128,0.3)} 50%{box-shadow:0 0 40px rgba(74,222,128,0.6)} }
        @keyframes scoreReveal { from{stroke-dashoffset:var(--circumference)} to{stroke-dashoffset:var(--target)} }
        .fade-in { animation: fadeIn 0.4s ease-out both; }
        .slide-in { animation: slideRight 0.3s ease-out both; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob1 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-10%', width: '600px', height: '600px',
          background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob2 25s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '20%', width: '550px', height: '550px',
          background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'blob3 22s ease-in-out infinite'
        }} />
      </div>
    </>
  );
}

// ============================================================
// THEME TOGGLE
// ============================================================
function ThemeToggle({ theme, setTheme, T }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 10,
        width: '40px', height: '40px', borderRadius: '50%',
        background: T.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.border}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text, transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ T, isDark, mode, setMode, numQuestions, setNumQuestions, selectedDomains, toggleDomain, timerEnabled, setTimerEnabled, timerDuration, setTimerDuration, startQuiz, questionsCount, showImport }) {
  const availableCount = DEFAULT_QUESTIONS.filter(q => selectedDomains.includes(q.d)).length;
  const canStart = selectedDomains.length > 0 && numQuestions > 0;
  const effectiveCount = Math.min(numQuestions, availableCount);

  return (
    <div className="fade-in" style={{ paddingTop: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', background: 'rgba(255,153,0,0.1)',
          border: '1px solid rgba(255,153,0,0.3)', borderRadius: '999px',
          marginBottom: '24px', fontSize: '11px', letterSpacing: '0.1em',
          textTransform: 'uppercase', fontFamily: FONT_MONO, color: T.accent
        }}>
          <Sparkles size={11} /> AWS Certified · AIF-C01
        </div>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 76px)', lineHeight: '1', margin: 0,
          fontFamily: FONT_SERIF, fontWeight: 400, letterSpacing: '-0.02em'
        }}>
          <span style={{ fontStyle: 'italic', color: T.accent }}>Examen blanc</span><br />
          <span>AI Practitioner</span>
        </h1>
        <p style={{ marginTop: '20px', fontSize: '15px', color: T.textDim, maxWidth: '480px', margin: '20px auto 0', lineHeight: '1.6' }}>
          {questionsCount} questions calibrées sur la pondération officielle AWS. Configure ta session puis lance-toi.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <Card T={T} title="Mode" icon={<Target size={14} />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ModeButton T={T} active={mode === 'training'} onClick={() => setMode('training')} title="Entraînement" desc="Feedback immédiat" icon={<BookOpen size={16} />} />
            <ModeButton T={T} active={mode === 'exam'} onClick={() => setMode('exam')} title="Examen blanc" desc="Feedback final" icon={<Trophy size={16} />} />
          </div>
        </Card>

        <Card T={T} title="Nombre de questions" icon={<BarChart3 size={14} />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <input type="range" min="5" max={Math.max(65, questionsCount)} step="5" value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: T.accent }} />
            <div style={{ fontFamily: FONT_MONO, fontSize: '30px', minWidth: '64px', textAlign: 'right', color: T.accent, fontWeight: 500 }}>
              {numQuestions}
            </div>
          </div>
          {effectiveCount < numQuestions && (
            <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', borderRadius: '8px', fontSize: '12px', color: T.accent }}>
              ⚠️ {availableCount} disponibles, session de {effectiveCount} questions. <button onClick={showImport} style={{ background: 'none', border: 'none', color: T.accent, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Importer plus ↗</button>
            </div>
          )}
        </Card>

        <Card T={T} title="Domaines" icon={<Brain size={14} />}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(DOMAINS).map(([d, info]) => {
              const isActive = selectedDomains.includes(parseInt(d));
              return (
                <button key={d} onClick={() => toggleDomain(parseInt(d))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                    background: isActive ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                    border: `1px solid ${isActive ? info.color + '60' : T.border}`,
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', color: T.text, fontFamily: FONT_SANS
                  }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isActive ? info.color : T.border,
                    boxShadow: isActive ? `0 0 12px ${info.color}80` : 'none',
                    transition: 'all 0.2s'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{info.name}</div>
                    <div style={{ fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO, marginTop: '2px' }}>
                      {info.short} · pondération {info.weight}
                    </div>
                  </div>
                  {isActive && <CheckCircle2 size={16} color={info.color} />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card T={T} title="Chronomètre" icon={<Clock size={14} />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: timerEnabled ? '16px' : '0' }}>
            <Switch T={T} active={timerEnabled} onClick={() => setTimerEnabled(!timerEnabled)} />
            <span style={{ fontSize: '14px', color: timerEnabled ? T.text : T.textMuted }}>
              {timerEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          {timerEnabled && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="range" min="5" max="180" step="5" value={timerDuration}
                  onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: T.accent }} />
                <div style={{ fontFamily: FONT_MONO, fontSize: '20px', minWidth: '70px', textAlign: 'right', color: T.accent }}>
                  {timerDuration} <span style={{ fontSize: '12px', color: T.textMuted }}>min</span>
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO }}>
                Examen réel : 130 min pour 65 questions
              </div>
            </>
          )}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', marginTop: '8px' }}>
          <button onClick={showImport}
            style={{
              padding: '20px', background: 'transparent', border: `1px solid ${T.border}`,
              borderRadius: '12px', color: T.text, cursor: 'pointer',
              fontFamily: FONT_SANS, fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = T.borderH}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = T.border}>
            <Upload size={16} /> Importer CSV
          </button>
          <button onClick={startQuiz} disabled={!canStart}
            style={{
              padding: '20px 28px', background: canStart ? T.accent : T.border,
              color: canStart ? '#0a0a0a' : T.textMuted, border: 'none', borderRadius: '12px',
              fontSize: '17px', fontWeight: 600, cursor: canStart ? 'pointer' : 'not-allowed',
              fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              transition: 'all 0.15s', letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => { if (canStart) e.currentTarget.style.background = T.accentH; }}
            onMouseLeave={(e) => { if (canStart) e.currentTarget.style.background = T.accent; }}>
            <Play size={18} fill="currentColor" />
            Commencer
            <span style={{ fontFamily: FONT_MONO, opacity: 0.7, fontSize: '13px' }}>
              · {effectiveCount}Q · {mode === 'exam' ? 'Examen' : 'Training'}
            </span>
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO }}>
          <Keyboard size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Raccourcis pendant le quiz : 1-4 ou A-D pour choisir · Entrée pour valider · Espace pour pause
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUIZ SCREEN
// ============================================================
function QuizScreen({ T, isDark, quiz, currentIdx, selectedAnswer, setSelectedAnswer, revealed, mode, answers, timerEnabled, timeLeft, isPaused, setIsPaused, submitAnswer, goNext, finishQuiz, streak }) {
  const q = quiz[currentIdx];
  const total = quiz.length;
  const progress = ((currentIdx + (revealed ? 1 : 0)) / total) * 100;
  const isCorrect = selectedAnswer === q.a;
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const timerCritical = timerEnabled && timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="fade-in">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: '13px', color: T.textDim }}>
          Q<span style={{ color: T.accent, marginLeft: '2px' }}>{currentIdx + 1}</span>/{total}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {streak >= 3 && (
            <div className="slide-in" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', background: 'rgba(251,146,60,0.15)',
              border: '1px solid rgba(251,146,60,0.4)', borderRadius: '999px',
              fontFamily: FONT_MONO, fontSize: '12px', color: '#fb923c'
            }}>
              <Flame size={12} /> {streak} streak
            </div>
          )}
          {timerEnabled && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: timerCritical ? 'rgba(248,113,113,0.15)' : 'rgba(255,153,0,0.1)',
              border: `1px solid ${timerCritical ? '#f87171' : 'rgba(255,153,0,0.3)'}`,
              borderRadius: '999px', fontFamily: FONT_MONO, fontSize: '13px',
              color: timerCritical ? '#f87171' : T.accent,
              animation: timerCritical ? 'pulse 1s infinite' : 'none'
            }}>
              <Clock size={12} /> {formatTime(timeLeft)}
            </div>
          )}
          {timerEnabled && (
            <button onClick={() => setIsPaused(!isPaused)}
              style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '999px', padding: '5px 10px', color: T.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: FONT_MONO }}>
              {isPaused ? <Play size={11} /> : <Pause size={11} />}
            </button>
          )}
          <button onClick={() => { if (window.confirm('Terminer maintenant ?')) finishQuiz(); }}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '999px', padding: '5px 10px', color: T.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO }}>
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar with dots */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: `linear-gradient(90deg, ${T.accent} 0%, ${T.accentH} 100%)`,
            boxShadow: `0 0 12px ${T.accent}60`,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Question card */}
      <div className="fade-in" style={{
        background: T.card, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${T.border}`, borderRadius: '18px', padding: '32px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: FONT_MONO, color: DOMAINS[q.d].color,
            padding: '4px 10px', background: `${DOMAINS[q.d].color}15`,
            border: `1px solid ${DOMAINS[q.d].color}40`, borderRadius: '999px'
          }}>
            {DOMAINS[q.d].short} · {DOMAINS[q.d].name}
          </span>
          <span style={{
            fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: FONT_MONO, color: T.textMuted,
            padding: '4px 10px', background: T.glassBg,
            border: `1px solid ${T.border}`, borderRadius: '999px'
          }}>
            {q.df === 'e' ? '○ Facile' : q.df === 'm' ? '◐ Moyen' : '● Difficile'}
          </span>
        </div>

        <h2 style={{
          fontFamily: FONT_SERIF, fontWeight: 400, fontSize: '24px',
          lineHeight: '1.4', margin: '0 0 28px 0', color: T.text, letterSpacing: '-0.01em'
        }}>{q.q}</h2>

        <div style={{ display: 'grid', gap: '10px' }}>
          {q.o.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isAnswer = i === q.a;
            let bg = 'transparent', border = T.border;
            if (revealed) {
              if (isAnswer) { bg = 'rgba(74,222,128,0.1)'; border = '#4ade80'; }
              else if (isSelected) { bg = 'rgba(248,113,113,0.1)'; border = '#f87171'; }
            } else if (isSelected) {
              bg = isDark ? 'rgba(255,153,0,0.1)' : 'rgba(255,102,0,0.08)'; border = T.accent;
            }
            return (
              <button key={i} onClick={() => !revealed && setSelectedAnswer(i)} disabled={revealed}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '14px 18px', background: bg, border: `1px solid ${border}`,
                  borderRadius: '10px', cursor: revealed ? 'default' : 'pointer',
                  textAlign: 'left', color: T.text, fontFamily: FONT_SANS,
                  fontSize: '14px', lineHeight: '1.5', transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!revealed && !isSelected) {
                    e.currentTarget.style.borderColor = T.borderH;
                    e.currentTarget.style.background = T.glassBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!revealed && !isSelected) {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.background = 'transparent';
                  }
                }}>
                <span style={{
                  fontFamily: FONT_MONO, fontWeight: 500, fontSize: '13px', minWidth: '20px',
                  color: isSelected || (revealed && isAnswer) ? (revealed ? (isAnswer ? '#4ade80' : '#f87171') : T.accent) : T.textMuted
                }}>
                  {LETTERS[i]}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {revealed && isAnswer && <CheckCircle2 size={18} color="#4ade80" />}
                {revealed && isSelected && !isAnswer && <XCircle size={18} color="#f87171" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {revealed && (
        <div className="fade-in" style={{
          background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: '14px', padding: '20px 24px', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {isCorrect ? (
              <><CheckCircle2 size={20} color="#4ade80" /><span style={{ fontSize: '16px', fontWeight: 600, color: '#4ade80' }}>Bonne réponse</span></>
            ) : (
              <>
                <XCircle size={20} color="#f87171" />
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#f87171' }}>Réponse incorrecte</span>
                <span style={{ fontSize: '13px', color: T.textDim, marginLeft: '6px', fontFamily: FONT_MONO }}>
                  · Bonne réponse : <span style={{ color: '#4ade80' }}>{LETTERS[q.a]}</span>
                </span>
              </>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.65', color: T.text, opacity: 0.9 }}>{q.e}</p>
          <div style={{ marginTop: '14px', fontSize: '11px', color: T.textMuted, fontFamily: FONT_MONO, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={11} /> Service AWS : <span style={{ color: T.accent }}>{q.s}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!revealed ? (
          <button onClick={submitAnswer} disabled={selectedAnswer === null}
            style={{
              padding: '14px 28px',
              background: selectedAnswer !== null ? T.accent : T.border,
              color: selectedAnswer !== null ? '#0a0a0a' : T.textMuted,
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
              cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            {mode === 'training' ? 'Valider' : 'Suivante'}
            <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={() => goNext()}
            style={{
              padding: '14px 28px', background: T.accent, color: '#0a0a0a',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT_SANS,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            {currentIdx + 1 === total ? 'Voir résultats' : 'Question suivante'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// RESULTS SCREEN
// ============================================================
function ResultsScreen({ T, isDark, quiz, answers, results, resetAll }) {
  const [reviewMode, setReviewMode] = useState(false);
  const [filterIncorrect, setFilterIncorrect] = useState(false);
  const verdictColor = results.awsScore >= 800 ? '#4ade80' : results.awsScore >= 700 ? T.accent : '#f87171';
  const verdictText = results.awsScore >= 800 ? 'Excellent — réussite confortable'
    : results.awsScore >= 700 ? 'Réussite probable — marge limitée'
    : results.awsScore >= 600 ? 'Échec probable — réviser les points faibles'
    : 'Score insuffisant — révision approfondie nécessaire';

  const chartData = Object.entries(results.byDomain)
    .filter(([_, v]) => v.total > 0)
    .map(([d, v]) => ({
      name: DOMAINS[d].short, fullName: DOMAINS[d].name,
      pct: Math.round((v.correct / v.total) * 100),
      correct: v.correct, total: v.total, color: DOMAINS[d].color
    }));

  if (reviewMode) return <ReviewMode T={T} isDark={isDark} quiz={quiz} answers={answers} setReviewMode={setReviewMode} filterIncorrect={filterIncorrect} setFilterIncorrect={setFilterIncorrect} />;

  return (
    <div className="fade-in" style={{ paddingTop: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '20px' }}>
          · Résultats · AIF-C01 ·
        </div>
        <ScoreRing score={results.awsScore} color={verdictColor} T={T} />
        <div style={{ marginTop: '16px', fontSize: '15px', color: verdictColor, fontWeight: 500 }}>{verdictText}</div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: T.textMuted, fontFamily: FONT_MONO }}>
          Score AWS estimé (réussite ≥ 700) · indicatif
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <StatBox T={T} label="Bonnes réponses" value={`${results.correct}/${results.total}`} accent="#4ade80" />
        <StatBox T={T} label="Précision" value={`${Math.round(results.pct)}%`} accent={T.accent} />
        <StatBox T={T} label="Meilleur streak" value={results.maxStreak} accent="#fb923c" icon={<Flame size={14} />} />
        <StatBox T={T} label="Verdict" value={results.passed ? 'RÉUSSITE' : 'ÉCHEC'} accent={verdictColor} />
      </div>

      <Card T={T} title="Performance par domaine" icon={<TrendingUp size={14} />}>
        <div style={{ width: '100%', height: '260px', marginTop: '8px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: T.textMuted, fontSize: 11, fontFamily: FONT_MONO }} stroke={T.border} />
              <YAxis dataKey="name" type="category" tick={{ fill: T.textDim, fontSize: 12, fontFamily: FONT_MONO }} stroke={T.border} />
              <Tooltip
                contentStyle={{ background: T.cardSolid, border: `1px solid ${T.border}`, borderRadius: '8px', fontFamily: FONT_SANS, fontSize: '12px' }}
                labelStyle={{ color: T.text }}
                formatter={(v, n, p) => [`${v}% (${p.payload.correct}/${p.payload.total})`, p.payload.fullName]} />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {chartData.some(d => d.pct < 70) && (
        <div style={{ marginTop: '20px' }}>
          <Card T={T} title="Points à retravailler" icon={<AlertCircle size={14} color="#f87171" />}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: T.text, opacity: 0.85, fontSize: '14px', lineHeight: '1.8' }}>
              {chartData.filter(d => d.pct < 70).sort((a, b) => a.pct - b.pct).map(d => (
                <li key={d.name}><strong style={{ color: d.color }}>{d.fullName}</strong> — {d.pct}% ({d.correct}/{d.total})</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setReviewMode(true)}
          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', background: 'transparent', border: `1px solid ${T.border}`, color: T.text, borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: FONT_SANS, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Eye size={16} /> Revoir les questions
        </button>
        <button onClick={resetAll}
          style={{ flex: 1, minWidth: '180px', padding: '14px 20px', background: T.accent, color: '#0a0a0a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={16} /> Nouvelle session
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ANIMATED SCORE RING
// ============================================================
function ScoreRing({ score, color, T }) {
  const [displayScore, setDisplayScore] = useState(0);
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / 1000, 1);
  const offset = circumference * (1 - pct);

  useEffect(() => {
    let raf;
    let start = null;
    const duration = 1400;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: '64px', lineHeight: '1', color, fontWeight: 400 }}>
          {displayScore}
        </div>
        <div style={{ fontSize: '12px', color: T.textMuted, fontFamily: FONT_MONO, marginTop: '4px' }}>
          / 1000
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REVIEW MODE
// ============================================================
function ReviewMode({ T, isDark, quiz, answers, setReviewMode, filterIncorrect, setFilterIncorrect }) {
  const list = filterIncorrect ? quiz.filter(q => answers[q.i] !== q.a) : quiz;
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: '32px', margin: 0, fontWeight: 400 }}>
          <span style={{ fontStyle: 'italic', color: T.accent }}>Revue</span> des questions
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilterIncorrect(!filterIncorrect)}
            style={{ padding: '8px 14px', background: filterIncorrect ? T.accent : 'transparent', color: filterIncorrect ? '#0a0a0a' : T.textDim, border: `1px solid ${filterIncorrect ? T.accent : T.border}`, borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {filterIncorrect ? <EyeOff size={12} /> : <Eye size={12} />}
            {filterIncorrect ? 'Erreurs' : 'Toutes'}
          </button>
          <button onClick={() => setReviewMode(false)}
            style={{ padding: '8px 14px', background: 'transparent', color: T.textDim, border: `1px solid ${T.border}`, borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT_MONO }}>
            ← Retour
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: T.textMuted, background: T.cardSolid, borderRadius: '12px', border: `1px solid ${T.border}` }}>
          <Award size={32} color="#4ade80" style={{ margin: '0 auto 12px', display: 'block' }} />
          Toutes les questions ont été correctement répondues ! 🎉
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {list.map((q, idx) => {
            const userAns = answers[q.i];
            const isCorrect = userAns === q.a;
            return (
              <div key={q.i} style={{
                background: T.cardSolid, border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                borderRadius: '12px', padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: T.textMuted }}>{q.i}</span>
                  <span style={{ padding: '3px 8px', borderRadius: '999px', fontFamily: FONT_MONO, fontSize: '10px', background: `${DOMAINS[q.d].color}15`, color: DOMAINS[q.d].color, border: `1px solid ${DOMAINS[q.d].color}30` }}>
                    {DOMAINS[q.d].short}
                  </span>
                  {isCorrect ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '11px', fontFamily: FONT_MONO }}><CheckCircle2 size={12} /> Correct</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '11px', fontFamily: FONT_MONO }}><XCircle size={12} /> Incorrect</span>}
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.5', marginBottom: '14px', color: T.text }}>{q.q}</div>
                <div style={{ display: 'grid', gap: '6px', marginBottom: '14px' }}>
                  {q.o.map((opt, i) => {
                    const isAns = i === q.a;
                    const isUser = i === userAns;
                    return (
                      <div key={i} style={{
                        fontSize: '13px', padding: '8px 12px',
                        background: isAns ? 'rgba(74,222,128,0.06)' : (isUser && !isAns ? 'rgba(248,113,113,0.06)' : 'transparent'),
                        border: `1px solid ${isAns ? 'rgba(74,222,128,0.2)' : isUser ? 'rgba(248,113,113,0.2)' : T.border}`,
                        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px'
                      }}>
                        <span style={{ fontFamily: FONT_MONO, color: isAns ? '#4ade80' : isUser ? '#f87171' : T.textMuted }}>{LETTERS[i]}</span>
                        <span style={{ flex: 1, color: T.text, opacity: 0.85 }}>{opt}</span>
                        {isAns && <CheckCircle2 size={14} color="#4ade80" />}
                        {isUser && !isAns && <XCircle size={14} color="#f87171" />}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '12px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6', color: T.text, opacity: 0.85, borderLeft: `2px solid ${DOMAINS[q.d].color}` }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, fontFamily: FONT_MONO, marginBottom: '6px' }}>
                    {q.s}
                  </div>
                  {q.e}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// IMPORT CSV MODAL
// ============================================================
function ImportModal({ T, isDark, onClose, onImport }) {
  const inputRef = useRef();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div className="fade-in" style={{
        background: T.cardSolid, border: `1px solid ${T.border}`, borderRadius: '16px',
        padding: '32px', maxWidth: '480px', width: '100%', position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'transparent',
          border: 'none', color: T.textMuted, cursor: 'pointer', padding: '4px'
        }}><X size={20} /></button>
        <FileText size={32} color={T.accent} style={{ marginBottom: '12px' }} />
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: '28px', margin: '0 0 8px 0', fontWeight: 400 }}>Importer des questions</h2>
        <p style={{ color: T.textDim, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          Sélectionne tes 5 fichiers CSV (D1, D2, D3, D4, D5) pour étendre la banque à 250 questions.
          Format requis : <span style={{ fontFamily: FONT_MONO, color: T.text, fontSize: '12px' }}>id, domain, difficulty, question, option_a-d, correct_answer, explanation, service</span>
        </p>
        <input ref={inputRef} type="file" accept=".csv" multiple onChange={(e) => onImport(e.target.files)}
          style={{ display: 'none' }} />
        <button onClick={() => inputRef.current?.click()}
          style={{
            width: '100%', padding: '40px 20px', background: 'transparent',
            border: `2px dashed ${T.border}`, borderRadius: '12px', color: T.text, cursor: 'pointer',
            fontSize: '14px', fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px', transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.glassBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}>
          <Upload size={28} color={T.accent} />
          <div>
            <div style={{ fontWeight: 500 }}>Cliquer pour sélectionner les CSV</div>
            <div style={{ fontSize: '12px', color: T.textMuted, marginTop: '4px' }}>Sélection multiple acceptée</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// UI PRIMITIVES
// ============================================================
function Card({ T, title, icon, children }) {
  return (
    <div style={{
      background: T.card, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px 22px'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
        fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: T.textMuted, fontFamily: FONT_MONO
      }}>{icon} {title}</div>
      {children}
    </div>
  );
}

function ModeButton({ T, active, onClick, title, desc, icon }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '16px', textAlign: 'left',
        background: active ? (T.accent === '#FF9900' ? 'rgba(255,153,0,0.08)' : 'rgba(255,102,0,0.06)') : 'transparent',
        border: `1px solid ${active ? T.accent : T.border}`,
        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s', color: T.text, fontFamily: FONT_SANS
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: active ? T.accent : T.textDim }}>
        {icon}<span style={{ fontSize: '15px', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: '12px', color: T.textMuted, lineHeight: '1.5' }}>{desc}</div>
    </button>
  );
}

function StatBox({ T, label, value, accent, icon }) {
  return (
    <div style={{
      background: T.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, fontFamily: FONT_MONO, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        {icon}{label}
      </div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: '24px', color: accent, fontWeight: 400 }}>{value}</div>
    </div>
  );
}

function Switch({ T, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', width: '46px', height: '26px',
      background: active ? T.accent : T.border, borderRadius: '999px',
      border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: active ? '23px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}
