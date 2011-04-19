import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class Top949Colors {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String[] colorsOrig = new String[949];
		//http://stackoverflow.com/questions/218061/get-the-applications-path
		String absolutePath = new java.io.File("").getAbsolutePath();
		File file = new File(absolutePath + "\\src\\rgb.csv");
		try {
			Scanner sc = new Scanner(file);
			int line = 0;
			while( sc.hasNextLine() && line < colorsOrig.length ){
				colorsOrig[line] = sc.nextLine();
				line++;
			}
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String[][] colors = new String[949][2];
		for(int i = 0; i < colorsOrig.length; i++){
			colors[i] = colorsOrig[i].split(",");
		}
		
		String JSON = "var top949 = {\n";
		for(int i = 0; i < colors.length; i++){
			String out = "";
			JSON += "\t\"" + colors[i][1].substring(1) + "\": {\n";
			for(int j = 0; j < (colors[i][1].length() - 1) / 2; j++){
				String hex = (colors[i][1].substring((j * 2) + 1, (j * 2) + 3)).toUpperCase();
				out += hex + ": " + Integer.parseInt(hex, 16) + ", ";
				if(j == 0)
					JSON += "\t\t\"r\": " + Integer.parseInt(hex, 16) + ",\n";
				else if(j == 1)
					JSON += "\t\t\"g\": " + Integer.parseInt(hex, 16) + ",\n";
				else if(j == 2)
					 JSON += "\t\t\"b\": " + Integer.parseInt(hex, 16) + ",\n";
			}
			//System.out.println(out);
			JSON += "\t\t\"name\": \"" + colors[i][0] + "\"\n";
			JSON += i < colors.length - 1 ? "\t},\n" : "\t}\n";
		}
		JSON += "};\n";
		System.out.println(JSON);
		
	}


}
