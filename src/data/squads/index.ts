import type { Player } from "../tournament";
import { PrE_A_male } from "./PrE_A_male";
import { IS_A_male } from "./IS_A_male";
import { AME_male } from "./AME_male";
import { EcE_A_male } from "./EcE_A_male";
import { CE_male } from "./CE_male";
import { EcE_B_male } from "./EcE_B_male";
import { IS_B_male } from "./IS_B_male";
import { PrE_B_male } from "./PrE_B_male";
import { IS_female } from "./IS_female";
import { CE_female } from "./CE_female";
import { PrE_female } from "./PrE_female";
import { AME_female } from "./AME_female";
import { EcE_female } from "./EcE_female";

export const SQUADS: Record<string, Player[]> = {
  "PrE(A)": PrE_A_male,
  "IS(A)": IS_A_male,
  "AME": AME_male,
  "EcE(A)": EcE_A_male,
  "CE_M": CE_male,
  "EcE(B)": EcE_B_male,
  "IS(B)": IS_B_male,
  "PrE(B)": PrE_B_male,
  "IS_F": IS_female,
  "CE_F": CE_female,
  "PrE_F": PrE_female,
  "AME_F": AME_female,
  "EcE_F": EcE_female,
};
