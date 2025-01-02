# Règles

## Préfixes du champ pieceRef

- AK : Augmentation de capital
- CC : Mouvement d'un compte du PCG à un autre compte du PCG lorsque 2 journaux différents sont impliqués (passage par le compte 580)
- CS : Mouvement d'un compte du PCG à un autre compte du PCG avec le même journal (sans passage par le compte 580)
- BQ : Paiement ou remboursement
- AC : Achats (on trouve la pièce correspondante dans le répertoire « Factures fournisseurs »)
- TX : Impots (on trouve la pièce correspondante dans le répertoire « Social et fiscal/Fiscal_Déclarations et avis sauf liasses IS »)
- FI : Remboursements d'un crédit (on trouve la pièce correspondante dans les échéanciers généralement rangés dans le répertoire « Contrats »)
- AG : Décisions d AG (on trouve la pièce correspondante dans le répertoire « Social et fiscal/AG »)
- NF : Factures non fournies
- EG : Factures égarées
- ER : Ecritures visant à corriger une erreur pendant l'exercice (imputation sur mauvais compte par exemple)
- RP : Ecriture de vidage des comptes 6 vers le compte 129 ou 119 au 1/1 de l'année

## Libellés des écritures

- Les écritures qui touchent aux comptes 4011 et 4041 n'ont pas n'ont pas besoin de spécifier le nom du fournisseur. Par contre, leurs écritures mirroirs vers le compte 512, les comptes de classe 6 ou les comptes 2131881 ou 2184001 le rappelle de la manière suivante: CODE FOURNISSEUR - Libellé

## Libellés des factures

### Pendant l'exercice:

LGDP_Exercice_MMDD_LetterCode_FournisseurCode_LibelleEcriture_DebitCredit_MoreInfoNotForAccountingPurposes

MMDD: Mois et jour de la facture

LetterCode:

- I: débite le compte de la maison 2131881
- M: débite le compte du mobilier 2184001
- F : débite le compte de fourniture (classe 6) associé à ce fournisseur

DebitCredit : positif pour un débit (une facture), négatif pour un crédit (un avoir)

### A la fin de l'exercice

Une fois qu'on a le numéro de facture calculé par le système, on modifie les libéllés de la manière suivante:
LGDP_Exercice_PieceRef_LetterCode_SupplierCode_LibelleEcriture_DebitCredit_MoreInfoNotForAccountingPurposes

# Utilisation

## Chargement des factures

Aller dans Outils -> Editeur de listes de fichier
Aller dans Editer -> Ajoiuter le dossier et ajouter le dossier "Factures fournisseurs partagé avec Alice"
Sélectionner toutes les factures qu'on ne veut pas et faire SUPPR
Aller dans Fichier -> Enregistrer sous
Puis retravailler le fichier avec vscode

## Augmentations de capital

Le capital souscrit non appelé, non versé est porté au crédit du compte 1011 et au débit du compte 109. Ce capital n'est pas dû à la société tant qu'il n'est pas appelé. Elle ne pourrait pas ester en justice pour le réclamer. C'est pour cela qu'il est neutre pour la classe 1. A chaque appel ou versement de capital, on débite le 1011 et on crédite le 109.

Lors du versement d'un capital non appelé, on débite le compte 512 et on crédite le compte 1013.

Si on appelle du capital, on crédite le compte 1012 et on débite le compte 4562. En parallèle, comme dit ci-avant, on débite le compte 1011 et on crédite le compte 109. Puis lorsqu'un associé apporte effectivement le capital, on débite le compte 512 et on crédite le compte 4562. Et on débite le 1012 et on crédite le 1013 pour faire passer le capital de appelé non versé à versé.

# A faire en 2024

- Il faut vider les comptes 1011 et 109 car le capital n'a en fait jamais été appelé
- Fusionner 2115881 avec 2131881.
