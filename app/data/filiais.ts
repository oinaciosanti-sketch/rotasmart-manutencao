export type Filial = {
  id: number;
  numeroFilial: string;
  nome: string;
  cidade: string;
  uf: string;
  endereco: string;
  cep: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  status: "ativo" | "desativado";
  latitude: number | null;
  longitude: number | null;
  geocodeStatus: "pendente" | "ok";
  statusDados: "ok" | "incompleto";
  observacoes: string;
};

const filial = (
  id:number, numeroFilial:string, nome:string, cidade:string, uf:string,
  endereco:string, cep:string, cnpj:string, inscricaoEstadual:string,
  telefone:string, status:"ativo"|"desativado"="ativo"
):Filial => {
  const incompleto=!cidade||!endereco||endereco==="-"||!cep;
  return {id,numeroFilial,nome,cidade,uf,endereco,cep,cnpj,inscricaoEstadual,telefone,status,
    latitude:null,longitude:null,geocodeStatus:"pendente",
    statusDados:incompleto?"incompleto":"ok",
    observacoes:incompleto?"Endereço incompleto no documento original":""};
};

export const filiais: Filial[] = [
  filial(1,"01","Posto Agricopel Filial 01 — Panetteria","Jaraguá do Sul","SC","Rua Walter Marquardt, 467 — Vila Nova","89259-700","83.488.882/0002-94","252.910.494","(47) 3372-8888"),
  filial(2,"02","Posto Agricopel Filial 02","Piên","PR","Rodovia PR 281, Km 32, 80 — Fernandes","83860-000","83.488.882/0003-75","90414044-90","(41) 3632-1908"),
  filial(3,"03","Posto Agricopel Filial 03","Jaraguá do Sul","SC","Rua Bernardo Dornbusch, 2400 — Baependi","89256-100","83.488.882/0004-56","252.993.675","(47) 3276-1502"),
  filial(4,"04","Posto Agricopel Filial 04","Jaraguá do Sul","SC","Rua José Narloch, 2015 — Tifa dos Martins","89253-790","83.488.882/0005-37","253.175.356","", "desativado"),
  filial(5,"05","Posto Agricopel Filial 05","Brusque","SC","Av. Lauro Müller, 149 — Centro","88353-040","83.488.882/0006-18","253.353.254","(47) 3355-3402"),
  filial(6,"06","Posto Agricopel Filial 06","Joinville","SC","Rua Marcos Welmuth, 2336 — Saguaçu","89221-740","83.488.882/0007-07","253.627.664","(47) 3425-2564"),
  filial(7,"08","Posto Agricopel Filial 08","Apiúna","SC","Av. Quintino Bocaiúva, 269 — Centro","89135-000","83.488.882/0009-60","254.322.972","(47) 3353-1196"),
  filial(8,"09","Posto Agricopel Filial 09","Pomerode","SC","Rua XV de Novembro, 2004 — Centro","89107-000","83.488.882/0010-02","254.450.113","(47) 3387-0777"),
  filial(9,"11","Posto Agricopel Filial 11","Porto Belo","SC","Avenida Governador Celso Ramos, 1499 — Perequê","88210-000","83.488.882/0012-66","254.450.148","(47) 3373-0883"),
  filial(10,"12","Posto Agricopel Filial 12","Itajaí","SC","Rodovia BR 101, Km 121, 8925 — São Vicente","88312-501","83.488.882/0013-47","254.505.040","(47) 3348-7671"),
  filial(11,"16","Posto Agricopel Filial 16","Blumenau","SC","Rodovia BR 470, Km 58, 4125 — Badenfurt","89070-205","83.488.882/0017-70","255.115.911","(47) 3144-8900"),
  filial(12,"17","Posto Agricopel Filial 17","","SC","-","","83.488.882/0018-51","","","desativado"),
  filial(13,"19","Posto Agricopel Filial 19","Joinville","SC","Rua Dona Francisca, 3125 — Saguaçu","89221-008","83.488.882/0020-76","255.243.693","(47) 3437-8259"),
  filial(14,"20","Posto Agricopel Filial 20","São Bento do Sul","SC","Av. Argolo, 282 — Centro","89280-061","83.488.882/0021-57","258.710.284","(47) 3635-0690"),
  filial(15,"21","Posto Agricopel Filial 21","Blumenau","SC","Rua São Paulo, 121 — Victor Konder","89010-175","83.488.882/0022-38","258.871.300","(47) 3513-5930"),
  filial(16,"23","Posto Agricopel Filial 23","Gaspar","SC","Rua Hercílio Fides Zimmermann, 1495 — Margem Esquerda","89116-650","83.488.882/0024-08","255.981.317","(47) 3308-0636"),
  filial(17,"24","Posto Agricopel Filial 24","Garuva","SC","Rodovia SC 416, 99 — Mina Velha","89248-000","83.488.882/0025-80","256.108.960","(47) 3372-8900"),
  filial(18,"28","Posto Agricopel Filial 28","Lages","SC","Avenida Duque de Caxias, 527 — Frei Rogério","88508-000","83.488.882/0029-04","256.336.580","(49) 3229-2150"),
  filial(19,"29","Posto Agricopel Filial 29","Florianópolis","SC","Rodovia José Carlos Daux, SC 401, 14298 — Canasvieiras","88052-840","83.488.882/0030-48","256.373.47","(47) 3372-8897"),
  filial(20,"30","Posto Agricopel Filial 30","Balneário Camboriú","SC","4ª Avenida, 700 — Centro","88330-110","83.488.882/0031-29","256.281.882","(47) 3344-0148"),
  filial(21,"31","Posto Agricopel Filial 31","Araquari","SC","Rodovia BR 101, Km 72, s/n — Itapocu","89245-000","83.488.882/0032-00","256.399.638","(47) 3452-0113"),
  filial(22,"35","Posto Agricopel Filial 35","Ituporanga","SC","Avenida Deputado Albino Zeni, 970 — Santo Antônio","88400-000","83.488.882/0036-33","258.269.782","(47) 3533-3519"),
  filial(23,"38","Posto Agricopel Filial 38","São José","SC","Rodovia BR 101, Km 207, s/n — Roçado","88102-120","83.488.882/0039-86","258.327.286",""),
  filial(24,"39","Posto Agricopel Filial 39","Rio do Sul","SC","Rua XV de Novembro, 1234 — Laranjeiras","89167-328","83.488.882/0040-10","258.327.294","(47) 3300-0037"),
  filial(25,"49","Posto Agricopel Filial 49","Balneário Camboriú","SC","Avenida Hermógenes de Assis Feijó — São Judas Tadeu","88332-400","83.488.882/0050-91","258.513.160",""),
  filial(26,"52","Posto Agricopel Filial 52","Navegantes","SC","Rodovia BR 470, Km 06, s/n — Volta Grande","88371-890","83.488.882/0053-34","258.674.261","(47) 3342-4683"),
  filial(27,"60","Posto Agricopel Filial 60 — Penha","Balneário Piçarras","SC","683F+R5, Balneário Piçarras","88385-000","83.488.882/0061-44","",""),
  filial(28,"61","Posto Agricopel Filial 61 — Contorno 280","","","-","","83.488.882/0062-25","",""),
  filial(29,"62","Posto Agricopel Filial 62 — Canta Galo","Rio do Sul","SC","Rodovia BR 470, 6867 — Canta Galo","89163-020","83.488.882/0063-06","262.628.872",""),
  filial(30,"63","Posto Agricopel Filial 63 — Bucarein","Joinville","SC","Av. Cel. Procópio Gomes, 1127 — Bucarein","89202-310","83.488.882/0064-97","",""),
  filial(31,"64","Posto Agricopel Filial 64 — Barra Velha","","SC","-","","83.488.882/0065-78","",""),
  filial(32,"65","Posto Agricopel Filial 65 — Araquari Corveta","","SC","-","","83.488.882/0066-59","",""),
  filial(33,"68","Posto Filial 68 — Rua São Paulo","Blumenau","SC","Rua São Paulo, 3149 — Itoupava Seca","89010-000","83.488.882/0069-00","257.580.573",""),
  filial(34,"69","Posto Agricopel Filial 69 — Jensen","Blumenau","SC","Rua Frederico Jensen, 1525 — Itoupavazinha","89066-300","83.488.882/0070-35","256.721.483",""),
  filial(35,"71","Posto Agricopel Filial 71 — Garcia II","Blumenau","SC","Rua Amazonas, 3783 — Garcia","89022-004","83.488.882/0072-05","258.437.472",""),
  filial(36,"72","Posto Agricopel Filial 72 — Ponte Aguda","Blumenau","SC","Rua República Argentina — Ponta Aguda","89050-100","83.488.882/0073-88","253.888.859",""),
  filial(37,"73","Posto Agricopel Filial 73 — Rua Bahia","Blumenau","SC","Rua Bahia, 2055 — Do Salto","89031-001","83.488.882/0074-69","260.289.353",""),
  filial(38,"74","Posto Agricopel Filial 74 — Martin Luther","Blumenau","SC","Av. Martin Luther, 1112 — Victor Konder","89012-010","83.488.882/0075-40","253.559.073",""),
  filial(39,"75","Posto Agricopel Filial 75 — Bela Vista","Gaspar","SC","Rua Anfilóquio Nunes Pires — Bela Vista","89110-001","83.488.882/0076-20","254.706.991",""),
  filial(40,"76","Posto Agricopel Filial 76 — Vorstadt","Blumenau","SC","Rua Itajaí, 2081 — Vorstadt","89015-203","83.488.882/0077-01","",""),
  filial(41,"77","Posto Agricopel Filial 77 — Itoupava Norte","Blumenau","SC","Rua 2 de Setembro, 3255 — Itoupava Norte","89052-505","83.488.882/0078-92","",""),
];

export const cidadesFiliais = Array.from(new Set(filiais.map(f=>f.cidade).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"pt-BR"));

