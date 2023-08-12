import "./reset.css";
import "./pathseg.js";
// @ts-expect-error
import decomp from "poly-decomp";
import { Common } from "matter-js";
Common.setDecomp(decomp);
