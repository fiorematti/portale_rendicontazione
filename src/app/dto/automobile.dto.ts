/** Rappresenta un'automobile restituita dall'API */
export interface AutomobileDto {
	idauto: number;
	marca: string;
	modello: string;
	targa: string;
	/** Tariffa per chilometro in euro */
	tariffaChilometrica: number;
	/** Cilindrata del motore in cc */
	cilindrata: number;
}
