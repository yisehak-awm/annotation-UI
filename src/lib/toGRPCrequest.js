import {
  AnnotationRequest,
  Annotation,
  Gene,
  Filter,
} from "../proto/annotation_pb";

// Given form data, construct GRPC request
export default function toGRPCrequest(formData) {
  // if form data is not set return immediately
  if (!formData) return;

  const {
    genes,
    ontology,
    pathway,
    biogrid,
    biologicalProcess,
    cellularComponent,
    molecularFunction,
    ontologyParents,
    smpdb,
    reactome,
    smallMolecules,
    crossAnnotateWithBiogrid,
    includeCodingRNA,
    includeNonCodingRNA,
    includeProtiens,
  } = formData;

  // function to capitalize and stringify booleans
  const prepBool = (b) => {
    const s = b.toString();
    return s[0].toUpperCase() + s.slice(1);
  };

  //   list of selected gene ontology namespaces
  const namespaces = [
    biologicalProcess && "biological_process",
    cellularComponent && "cellular_component",
    molecularFunction && "molecular_function",
  ].filter((n) => n);

  //   list of selected pathways
  const pathways = [smpdb && "smpdb", reactome && "reactome"].filter((n) => n);

  //   construct filters
  const namespace = new Filter(["namespace", namespaces.join(" ")]);
  const parents = new Filter(["parents", ontologyParents.toString()]);
  const ps = new Filter(["pathway", pathways.join(" ")]);
  const ism = new Filter(["include_sm", prepBool(smallMolecules)]);
  const ip = new Filter(["protien", prepBool(includeProtiens)]);
  const iprt = new Filter(["include_prot", prepBool(includeProtiens)]);
  const capb = new Filter(["biogrid", crossAnnotateWithBiogrid ? "1" : "0"]);
  const int = new Filter("interaction", includeProtiens ? "Proteins" : "Genes");
  const coding = new Filter(["coding", prepBool(includeCodingRNA)]);
  const noncoding = new Filter(["noncoding", prepBool(includeNonCodingRNA)]);
  const protien = new Filter(["protien", includeProtiens ? "1" : "0"]);

  // construct annotation objects with their filters
  const go = new Annotation(["gene-go-annotation", [namespace, parents, ip]]);
  const gp = new Annotation(["gene-pathway-annotation", [ps, iprt, ism, capb]]);
  const ba = new Annotation(["biogrid-interaction-annotation", [int]]);
  const rna = new Annotation(["include-rna", [coding, noncoding, protien]]);
  const annotationList = [
    ...(ontology ? [go] : []),
    ...(pathway ? [gp] : []),
    ...(biogrid ? [ba] : []),
    ...(includeCodingRNA || includeNonCodingRNA ? [rna] : []),
  ];

  //   construct gene list
  const geneList = genes.map((g) => {
    const gene = new Gene();
    gene.setGenename(g.trim());
    return gene;
  });

  const request = new AnnotationRequest();
  request.setGenesList(geneList);
  request.setAnnotationsList(annotationList);
  return request;
}
