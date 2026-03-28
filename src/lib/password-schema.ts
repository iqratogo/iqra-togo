/* Règles de complexité mot de passe — partagé API + frontend */

import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une lettre majuscule")
  .regex(/[a-z]/, "Au moins une lettre minuscule")
  .regex(/[0-9]/, "Au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial (ex : @, !, #…)")
