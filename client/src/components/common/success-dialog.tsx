import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  primaryActionText: string;
  secondaryActionText?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

export default function SuccessDialog({
  isOpen,
  title,
  description,
  primaryActionText,
  secondaryActionText,
  onPrimaryAction,
  onSecondaryAction
}: SuccessDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={secondaryActionText ? "sm:grid-cols-2" : ""}>
          {secondaryActionText && (
            <AlertDialogAction 
              onClick={onSecondaryAction}
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            >
              {secondaryActionText}
            </AlertDialogAction>
          )}
          <AlertDialogAction onClick={onPrimaryAction}>
            {primaryActionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
